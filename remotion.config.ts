import { Config } from "@remotion/cli/config";
import { cpus } from "node:os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Concurrency 자동 결정 — 측정 결과 (16코어 맥, 03 섹션 1650 frames):
//   1 워커 → 123초 (baseline)
//   4 워커 → 37초 (3.3배)
//   8 워커 → 27초 (4.6배) ⭐ sweet spot
//   16 워커 → 29초 (컨텍스트 스위칭으로 역전)
// 병렬 섹션 렌더는 효과 없음 (Bundling I/O 경쟁이 병목).
// max=8 상한 + 시스템에 2코어 남기기로 저사양 머신도 안전.
Config.setConcurrency(Math.min(8, Math.max(1, cpus().length - 2)));
