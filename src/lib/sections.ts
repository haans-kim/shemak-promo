// 섹션 메타데이터.
// v15: TTS_final.mp3 (182.88s)
// v16~v18: TTS_final v2.mp3 (181.84s)
// v19 1차: hyperframes/audio (228.82s) — wrong audio
// v19 2차 (2026-05-04): 0. 아나운서 버전 wav 9개 (합 349.06s = 5:49) — FINAL
//   ※ 07 시너지 섹션 부활

import { VIDEO } from "./brand";

export type SectionId = "01" | "02" | "03" | "04" | "05" | "06" | "08" | "09";

export interface SectionMeta {
  id: SectionId;
  slug: string;
  title: string;
  estimatedSeconds: number;
  audioFile: string;
}

// v20 (2026-05-07): 5/4 + 5/7 splice 사용자 컨펌 버전 + 07 시너지 제거
// transcribe 측정 후 정확한 값으로 갱신 예정
export const SECTIONS: Record<SectionId, SectionMeta> = {
  "01": { id: "01", slug: "01-intro",      title: "Intro",      estimatedSeconds: 35.29, audioFile: "audio/01-intro.wav" },
  "02": { id: "02", slug: "02-ig-intro",   title: "IG 소개",    estimatedSeconds: 16.35, audioFile: "audio/02-ig-intro.wav" },
  "03": { id: "03", slug: "03-hr-agent",   title: "HR Agent",   estimatedSeconds: 53.08, audioFile: "audio/03-hr-agent.wav" },
  "04": { id: "04", slug: "04-bridge",     title: "Bridge",     estimatedSeconds: 6.09,  audioFile: "audio/04-bridge.wav" },
  "05": { id: "05", slug: "05-optic-view", title: "Optic",      estimatedSeconds: 34.25, audioFile: "audio/05-optic-view.wav" },
  "06": { id: "06", slug: "06-pan-hr",     title: "판",         estimatedSeconds: 17.01, audioFile: "audio/06-pan-hr.wav" },
  "08": { id: "08", slug: "08-foundation", title: "Foundation", estimatedSeconds: 27.80, audioFile: "audio/08-foundation.wav" },
  "09": { id: "09", slug: "09-closing",    title: "Closing",    estimatedSeconds: 21.08, audioFile: "audio/09-closing.wav" },  // 18.08 + 3s Contact stay
};

export const secondsToFrames = (s: number): number => Math.round(s * VIDEO.fps);
