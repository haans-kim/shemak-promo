// 섹션 메타데이터.
// Typecast 1.2x 배속 기준 (2026-04-15). 음성길이 + 약 1초 버퍼.

import { VIDEO } from "./brand";

export type SectionId = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09";

export interface SectionMeta {
  id: SectionId;
  slug: string;
  title: string;
  estimatedSeconds: number;
  audioFile: string;
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  // 피드백 #2: 01 → 02 사이 pause 너무 김. 01 19s로 줄여 02 시작 빠르게.
  // 피드백 #7: 04 → 05 사이 pause가 짧아 옵틱뷰가 빨리 등장 → 04를 13s로 늘림.
  "01": { id: "01", slug: "01-intro",      title: "Intro",         estimatedSeconds: 19, audioFile: "audio/01-intro.mp3" },
  "02": { id: "02", slug: "02-ig-intro",   title: "IG 소개",       estimatedSeconds: 13, audioFile: "audio/02-ig-intro.mp3" },
  "03": { id: "03", slug: "03-hr-agent",   title: "HR Agent",      estimatedSeconds: 55, audioFile: "audio/03-hr-agent.mp3" },
  "04": { id: "04", slug: "04-bridge",     title: "Bridge",        estimatedSeconds: 11.5, audioFile: "audio/04-bridge.mp3" },
  "05": { id: "05", slug: "05-optic-view", title: "Optic View",    estimatedSeconds: 56, audioFile: "audio/05-optic-view.mp3" },
  "06": { id: "06", slug: "06-pan-hr",     title: "Pan HR",        estimatedSeconds: 38, audioFile: "audio/06-pan-hr.mp3" },
  "07": { id: "07", slug: "07-synergy",    title: "Synergy",       estimatedSeconds: 17, audioFile: "audio/07-synergy.mp3" },
  "08": { id: "08", slug: "08-foundation", title: "Foundation",    estimatedSeconds: 15, audioFile: "audio/08-foundation.mp3" },
  "09": { id: "09", slug: "09-closing",    title: "Closing + CTA", estimatedSeconds: 27, audioFile: "audio/09-closing.mp3" },
};

export const secondsToFrames = (s: number): number => Math.round(s * VIDEO.fps);
