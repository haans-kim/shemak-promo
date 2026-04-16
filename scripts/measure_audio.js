// 각 mp3 파일 길이 측정 후 sections.ts에 반영 가능한 형태로 출력
const { getAudioDurationInSeconds } = require("@remotion/media-utils");
const path = require("path");

const FILES = [
  ["01", "01-intro.mp3"],
  ["02", "02-ig-intro.mp3"],
  ["03", "03-hr-agent.mp3"],
  ["04", "04-bridge.mp3"],
  ["05", "05-optic-view.mp3"],
  ["06", "06-pan-hr.mp3"],
  ["07", "07-synergy.mp3"],
  ["08", "08-foundation.mp3"],
  ["09", "09-closing.mp3"],
];

(async () => {
  console.log("Section | Duration (s) | Frames@30fps");
  console.log("--------|-------------|-------------");
  let total = 0;
  for (const [id, fname] of FILES) {
    const fp = path.resolve(__dirname, "..", "public", "audio", fname);
    const dur = await getAudioDurationInSeconds(fp);
    const buffer = 1.0; // 0.5s before + 0.5s after
    const padded = Math.ceil(dur + buffer);
    total += padded;
    console.log(`${id}      | ${dur.toFixed(2).padStart(6)}      | ${(padded * 30).toString().padStart(5)}  → estimatedSeconds: ${padded}`);
  }
  console.log("--------|-------------|-------------");
  console.log(`TOTAL: ${total}s = ${Math.floor(total / 60)}m ${total % 60}s`);
})();
