#!/usr/bin/env node
// 섹션별 렌더 + ffmpeg concat 파이프라인.
// 전체 Main을 한 번에 렌더하면 T14에서 1시간 넘게 걸리는 문제를 피하기 위함.
//
// Usage:
//   node scripts/render_all.mjs                 # 캐시 유효하면 skip, 아니면 재렌더 + concat
//   node scripts/render_all.mjs --force         # 9개 모두 재렌더 + concat
//   node scripts/render_all.mjs --only=03,05    # 지정 섹션만 렌더 (concat은 전체 필요)
//   node scripts/render_all.mjs --no-concat     # 렌더만, concat 건너뜀
//   node scripts/render_all.mjs --concat-only   # 기존 섹션 파일로 concat만
//
// 캐시 유효성: 섹션 mp4가 존재 && 크기 > 0 && src/ 와 audio 파일보다 최신일 것.
// 요구사항: ffmpeg (brew install ffmpeg / apt install ffmpeg / choco install ffmpeg)

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SECTIONS_FILE = resolve(ROOT, "src/lib/sections.ts");
const SRC_DIR = resolve(ROOT, "src");
const AUDIO_DIR = resolve(ROOT, "public/audio");
const OUT_DIR = resolve(ROOT, "out/sections");
const pad = (n) => String(n).padStart(2, "0");
const _now = new Date();
const TS = `${_now.getFullYear()}${pad(_now.getMonth() + 1)}${pad(_now.getDate())}_${pad(_now.getHours())}${pad(_now.getMinutes())}`;
const FINAL = resolve(ROOT, `out/shemak_${TS}.mp4`);
const LATEST = resolve(ROOT, "out/shemak.mp4");

const sectionsSrc = readFileSync(SECTIONS_FILE, "utf8");
const slugs = [...sectionsSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
if (slugs.length === 0) {
  console.error(`[error] src/lib/sections.ts 에서 slug를 찾지 못함: ${SECTIONS_FILE}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const CONCAT_ONLY = args.includes("--concat-only");
const NO_CONCAT = args.includes("--no-concat");
const onlyArg = args.find((a) => a.startsWith("--only="));
const onlyList = onlyArg
  ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean)
  : null;

function newestMtimeIn(dir) {
  let latest = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = resolve(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        const m = statSync(full).mtimeMs;
        if (m > latest) latest = m;
      }
    }
  }
  return latest;
}

const SRC_NEWEST = newestMtimeIn(SRC_DIR);

// 캐시 판정 — severity에 따라 동작이 다름:
//   "rebuild" (missing/corrupt): concat이 실패하므로 무조건 재렌더.
//   "warn" (src 또는 audio가 더 최신): 경고만 하고 기존 mp4 유지. --force 로 재렌더하도록 유도.
//   (없음): 완전 유효.
function cacheStatus(out, slug) {
  if (!existsSync(out)) return { valid: false, severity: "rebuild", reason: "missing" };
  const st = statSync(out);
  if (st.size === 0) return { valid: false, severity: "rebuild", reason: "corrupt (0 bytes)" };
  if (SRC_NEWEST > st.mtimeMs) return { valid: false, severity: "warn", reason: "src/ newer than cache" };
  const audio = resolve(AUDIO_DIR, `${slug}.mp3`);
  if (existsSync(audio) && statSync(audio).mtimeMs > st.mtimeMs) {
    return { valid: false, severity: "warn", reason: "audio file newer than cache" };
  }
  return { valid: true };
}

function requireFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (r.status !== 0) {
    console.error("[error] ffmpeg 미설치. concat을 실행하려면 ffmpeg 필요:");
    console.error("  macOS:   brew install ffmpeg");
    console.error("  Ubuntu:  sudo apt install ffmpeg");
    console.error("  Windows: choco install ffmpeg  (또는 scoop install ffmpeg)");
    process.exit(1);
  }
}

function renderSection(slug) {
  const out = resolve(OUT_DIR, `${slug}.mp4`);
  if (!FORCE) {
    const cache = cacheStatus(out, slug);
    if (cache.valid) {
      console.log(`[skip]   ${slug} — 캐시 유효.`);
      return out;
    }
    if (cache.severity === "warn") {
      console.log(`[warn]   ${slug} — ${cache.reason}. 캐시 유지 (새 변경 반영하려면 --force 또는 --only=${slug}).`);
      return out;
    }
    console.log(`[rebuild] ${slug} — ${cache.reason}, 재렌더.`);
  } else {
    console.log(`[force]  ${slug} — --force 플래그로 재렌더.`);
  }
  console.log(`[render] ${slug} → ${out}`);
  const r = spawnSync("npx", ["remotion", "render", slug, out], {
    stdio: "inherit",
    cwd: ROOT,
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error(`[error]  ${slug} 렌더 실패`);
    process.exit(r.status ?? 1);
  }
  return out;
}

// v18+: Main.tsx의 TransitionSeries fade를 concat 단계에서도 반영하려면
// ffmpeg xfade(video) + acrossfade(audio) 체인이 필요.
// 단순 -c copy concat은 cut 경계가 hard — v18 "08→09 흰 화면" 피드백 대응.
// FADE_FRAMES 는 Main.tsx의 TRANSITION_FRAMES 와 동일해야 함 (30fps 기준).
const FADE_FRAMES = 15;
const FPS = 30;
const FADE_DURATION = FADE_FRAMES / FPS; // 0.5s

function probeDuration(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    console.error(`[error] ffprobe 실패: ${file}`);
    process.exit(r.status ?? 1);
  }
  const d = parseFloat(r.stdout.trim());
  if (!Number.isFinite(d) || d <= 0) {
    console.error(`[error] 잘못된 duration: ${file} → ${r.stdout}`);
    process.exit(1);
  }
  return d;
}

function concatAll() {
  requireFfmpeg();
  const files = slugs.map((s) => resolve(OUT_DIR, `${s}.mp4`));
  const problems = files
    .map((f) => {
      if (!existsSync(f)) return { f, reason: "missing" };
      if (statSync(f).size === 0) return { f, reason: "corrupt (0 bytes)" };
      return null;
    })
    .filter(Boolean);
  if (problems.length > 0) {
    console.error("[error] concat에 필요한 섹션 파일 문제:");
    problems.forEach(({ f, reason }) => console.error(`  - ${f} (${reason})`));
    console.error("먼저 `npm run render:sections` 로 렌더하세요.");
    process.exit(1);
  }

  // 각 섹션 실제 duration 측정 (sections.ts estimatedSeconds 와 frame 반올림 차이 흡수)
  const durations = files.map(probeDuration);
  console.log(`[concat] ${files.length}개 섹션 xfade(${FADE_DURATION}s) → ${FINAL}`);
  durations.forEach((d, i) => console.log(`  [${slugs[i]}] ${d.toFixed(3)}s`));

  // filter_complex 구성:
  //   xfade(video): 각 경계에서 offset=현재 누적길이-FADE, duration=FADE
  //   acrossfade(audio): 동일 duration 의 crossfade
  const vChain = [];
  const aChain = [];
  let cumulative = durations[0]; // 첫 xfade 기준 누적 길이
  let vPrev = "[0:v]";
  let aPrev = "[0:a]";
  for (let i = 1; i < files.length; i++) {
    const isLast = i === files.length - 1;
    const vOut = isLast ? "[vout]" : `[v${i}]`;
    const aOut = isLast ? "[aout]" : `[a${i}]`;
    const offset = cumulative - FADE_DURATION;
    vChain.push(`${vPrev}[${i}:v]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset.toFixed(4)}${vOut}`);
    aChain.push(`${aPrev}[${i}:a]acrossfade=d=${FADE_DURATION}${aOut}`);
    vPrev = vOut;
    aPrev = aOut;
    cumulative = cumulative + durations[i] - FADE_DURATION;
  }
  const filterComplex = [...vChain, ...aChain].join(";");

  const inputs = files.flatMap((f) => ["-i", f]);
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      ...inputs,
      "-filter_complex", filterComplex,
      "-map", "[vout]",
      "-map", "[aout]",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      FINAL,
    ],
    { stdio: "inherit", cwd: ROOT }
  );
  if (r.status !== 0) {
    console.error("[error] ffmpeg xfade concat 실패.");
    process.exit(r.status ?? 1);
  }
  if (existsSync(LATEST)) unlinkSync(LATEST);
  symlinkSync(FINAL, LATEST);
  // 이전 타임스탬프 mp4 정리 — 최종본 1개만 유지
  const outDir = resolve(ROOT, "out");
  for (const name of readdirSync(outDir)) {
    if (/^shemak_\d{8}_\d{4}\.mp4$/.test(name) && resolve(outDir, name) !== FINAL) {
      unlinkSync(resolve(outDir, name));
      console.log(`[clean]  ${name}`);
    }
  }
  console.log(`[done]   ${FINAL}`);
  console.log(`[latest] ${LATEST} → ${FINAL}`);
}

mkdirSync(OUT_DIR, { recursive: true });

if (!CONCAT_ONLY) {
  const targets = onlyList
    ? slugs.filter((s) => onlyList.some((o) => s === o || s.startsWith(`${o}-`)))
    : slugs;
  if (targets.length === 0) {
    console.error(`[error] --only=${onlyArg} 와 매칭되는 섹션 없음. slugs: ${slugs.join(", ")}`);
    process.exit(1);
  }
  for (const slug of targets) renderSection(slug);
}

if (!NO_CONCAT) {
  concatAll();
}
