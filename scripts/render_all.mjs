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
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SECTIONS_FILE = resolve(ROOT, "src/lib/sections.ts");
const SRC_DIR = resolve(ROOT, "src");
const AUDIO_DIR = resolve(ROOT, "public/audio");
const OUT_DIR = resolve(ROOT, "out/sections");
const CONCAT_LIST = resolve(ROOT, "out/concat.txt");
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
  // ffmpeg concat demuxer는 Windows에서 backslash 경로를 escape로 해석해 깨짐.
  // forward slash로 정규화하면 모든 플랫폼에서 안전.
  const list = files
    .map((f) => `file '${f.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
    .join("\n");
  writeFileSync(CONCAT_LIST, list + "\n");
  console.log(`[concat] ${files.length}개 섹션 → ${FINAL}`);
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", CONCAT_LIST, "-c", "copy", FINAL],
    { stdio: "inherit", cwd: ROOT }
  );
  if (r.status !== 0) {
    console.error("[error] ffmpeg concat 실패. 코덱 파라미터 불일치라면 재인코딩 필요:");
    console.error(`  ffmpeg -f concat -safe 0 -i ${CONCAT_LIST} -c:v libx264 -c:a aac ${FINAL}`);
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
