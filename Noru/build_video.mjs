// Noru 데모 영상 빌드 — 스틸 16장을 원본 음성에 싱크해 1080p 슬라이드쇼로 제작.
//
// 타임라인(이미지 Timeline.docx)을 단일 소스로 둔다. 05:15에서 끊고 음성 페이드아웃.
//   - 정적 화면      : 스틸 그대로 (선명도 유지)
//   - 스크롤 2구간    : 이전 화면 → 스크롤 화면으로 위로 밀어올리는 slideup (진짜 스크롤 느낌)
//   - 슬라이더 4상태  : 상태 간 크로스페이드 (바/예측값이 변하는 느낌)
//
// 실행:  node Noru/build_video.mjs        (repo 루트에서)
// 산출:  Noru/renders/noru_<timestamp>.mp4

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("Noru");
const BUILD = path.join(ROOT, "build");
const RENDERS = path.join(ROOT, "renders");
const AUDIO_SRC = path.join(ROOT, "Noru.mp4");

const W = 1920, H = 1080, FPS = 30;
const SLIDE = 1.0;       // 스크롤 슬라이드업 길이(초)
const SLIDE_HOLD = 0.4;  // 슬라이드 전 이전 화면 정지 시간(초)
const XF = 0.5;          // 슬라이더 상태 간 크로스페이드 길이(초)

// 화면 normalize 필터 (이미 1920x1080이지만 안전하게 scale/pad)
const NORM = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS},format=yuv420p`;

// 공통 x264 인코딩 옵션 (concat -c copy 위해 모든 클립 동일 파라미터)
const ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18",
             "-profile:v", "high", "-level", "4.2", "-pix_fmt", "yuv420p", "-r", String(FPS), "-an"];

const img = (name) => path.join(ROOT, name);

function ff(args, label) {
  process.stdout.write(`  [ffmpeg] ${label}\n`);
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
}

// --- 클립 생성기 ---------------------------------------------------------

function still(name, dur, out) {
  ff(["-loop", "1", "-t", dur.toFixed(3), "-i", img(name),
      "-vf", NORM, ...ENC, out], `still  ${name}  ${dur}s`);
}

// before 화면이 잠깐 보이다가 after 화면으로 위로 스크롤(slideup). 이후 after 홀드.
function scroll(before, after, dur, out) {
  const inA = (SLIDE_HOLD + SLIDE).toFixed(3);
  const inB = (dur - SLIDE_HOLD).toFixed(3);
  const fc =
    `[0:v]${NORM},setpts=PTS-STARTPTS[a];` +
    `[1:v]${NORM},setpts=PTS-STARTPTS[b];` +
    `[a][b]xfade=transition=slideup:duration=${SLIDE}:offset=${SLIDE_HOLD},format=yuv420p[v]`;
  ff(["-loop", "1", "-t", inA, "-i", img(before),
      "-loop", "1", "-t", inB, "-i", img(after),
      "-filter_complex", fc, "-map", "[v]", ...ENC, out],
     `scroll ${before} -> ${after}  ${dur}s`);
}

// states: [{name, dur}] 순서대로 크로스페이드로 연결. 총길이 = Σdur - (n-1)*XF
function sliderChain(states, out) {
  const inputs = [];
  states.forEach((s) => { inputs.push("-loop", "1", "-t", s.dur.toFixed(3), "-i", img(s.name)); });

  let fc = states.map((_, i) => `[${i}:v]${NORM},setpts=PTS-STARTPTS[s${i}]`).join(";") + ";";
  let prev = "s0";
  let combined = states[0].dur;           // 지금까지 합쳐진 길이
  for (let i = 1; i < states.length; i++) {
    const offset = (combined - XF).toFixed(3);
    const outLbl = i === states.length - 1 ? "v" : `x${i}`;
    const tail = i === states.length - 1 ? ",format=yuv420p" : "";
    fc += `[${prev}][s${i}]xfade=transition=fade:duration=${XF}:offset=${offset}${tail}[${outLbl}];`;
    combined = combined + states[i].dur - XF;
    prev = outLbl;
  }
  fc = fc.replace(/;$/, "");
  ff([...inputs, "-filter_complex", fc, "-map", "[v]", ...ENC, out],
     `slider ${states.map((s) => s.name.replace("스크린10 ", "")).join("+")}`);
}

// --- 타임라인 (단일 소스) ------------------------------------------------
// dur 합 = 318초 (05:18). 내용 05:15(315s) + 원상복구2 정지 3초 tail.

const SEGMENTS = [
  { kind: "still",  name: "스크린1.png",  dur: 118 },
  { kind: "still",  name: "스크린2.png",  dur: 45 },
  { kind: "still",  name: "스크린3.png",  dur: 9 },
  { kind: "still",  name: "스크린4.png",  dur: 5 },
  { kind: "still",  name: "스크린5.png",  dur: 7 },
  { kind: "still",  name: "스크린6.png",  dur: 11 },
  { kind: "still",  name: "스크린7.png",  dur: 19 },
  { kind: "still",  name: "스크린8.png",  dur: 3 },
  { kind: "still",  name: "스크린9.png",  dur: 55 },
  { kind: "scroll", before: "스크린9.png",  after: "스크린9 scroll down.png",  dur: 10 },
  { kind: "still",  name: "스크린10.png", dur: 5 },
  { kind: "scroll", before: "스크린10.png", after: "스크린10 scroll down.png", dur: 13 },
  { kind: "slider", states: [
      { name: "스크린10 바 조정1.png",  dur: 6.5 },
      { name: "스크린10 원상복구1.png", dur: 2.5 },
      { name: "스크린10 바 조정2.png",  dur: 7.0 },
      { name: "스크린10 원상복구2.png", dur: 8.5 },   // 마지막 화면 5:23까지 홀드. Σ24.5 - 3*0.5 = 23s
    ] },
];

const CONTENT_END = 323;   // 05:23 — 여기서 영상/음성 종료
const FADE = 2;            // 페이드아웃 길이(초) → 5:21~5:23

// --- 빌드 ----------------------------------------------------------------

function clean(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

console.log("Noru 영상 빌드 시작\n");
if (!existsSync(AUDIO_SRC)) throw new Error(`음성 원본 없음: ${AUDIO_SRC}`);
clean(BUILD);
mkdirSync(RENDERS, { recursive: true });

const total = SEGMENTS.reduce((a, s) => a + (s.dur ?? s.states.reduce((b, x) => b + x.dur, 0) - (s.states.length - 1) * XF), 0);
console.log(`총 길이: ${total}s (${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")})\n`);

const clips = [];
SEGMENTS.forEach((seg, i) => {
  const out = path.join(BUILD, `seg${String(i).padStart(2, "0")}.mp4`);
  if (seg.kind === "still") still(seg.name, seg.dur, out);
  else if (seg.kind === "scroll") scroll(seg.before, seg.after, seg.dur, out);
  else if (seg.kind === "slider") sliderChain(seg.states, out);
  clips.push(out);
});

// concat (동일 파라미터라 -c copy)
const listFile = path.join(BUILD, "list.txt");
writeFileSync(listFile, clips.map((c) => `file '${c}'`).join("\n") + "\n");
const videoOnly = path.join(BUILD, "video.mp4");
ff(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", videoOnly], "concat → video.mp4");

// 음성 mux: 0~315초, 311~315 페이드아웃, 이후 무음 (영상 tail까지 apad)
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const finalOut = path.join(RENDERS, `noru_${stamp}.mp4`);
const af = `[1:a]atrim=0:${CONTENT_END},asetpts=PTS-STARTPTS,afade=t=out:st=${CONTENT_END - FADE}:d=${FADE},apad[a]`;
ff(["-i", videoOnly, "-i", AUDIO_SRC,
    "-filter_complex", af, "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
    finalOut], "음성 mux → 최종");

console.log(`\n완료: ${finalOut}`);
