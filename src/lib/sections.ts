// 섹션 메타데이터.
// 2026-04-21: TTS_final.mp3 (182.88s) 기준 — 07 시너지 섹션 제거, 총 8섹션.

import { VIDEO } from "./brand";

export type SectionId = "01" | "02" | "03" | "04" | "05" | "06" | "08" | "09";

export interface SectionMeta {
  id: SectionId;
  slug: string;
  title: string;
  estimatedSeconds: number;
  audioFile: string;
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  "01": { id: "01", slug: "01-intro",      title: "Intro",      estimatedSeconds: 31.74, audioFile: "audio/01-intro.mp3" },
  "02": { id: "02", slug: "02-ig-intro",   title: "IG 소개",    estimatedSeconds: 15.41, audioFile: "audio/02-ig-intro.mp3" },
  "03": { id: "03", slug: "03-hr-agent",   title: "HR Agent",   estimatedSeconds: 47.05, audioFile: "audio/03-hr-agent.mp3" },
  "04": { id: "04", slug: "04-bridge",     title: "Bridge",     estimatedSeconds: 4.96,  audioFile: "audio/04-bridge.mp3" },
  "05": { id: "05", slug: "05-optic-view", title: "Optic",      estimatedSeconds: 30.98, audioFile: "audio/05-optic-view.mp3" },
  "06": { id: "06", slug: "06-pan-hr",     title: "판",         estimatedSeconds: 15.86, audioFile: "audio/06-pan-hr.mp3" },
  "08": { id: "08", slug: "08-foundation", title: "Foundation", estimatedSeconds: 20.11, audioFile: "audio/08-foundation.mp3" },
  "09": { id: "09", slug: "09-closing",    title: "Closing",    estimatedSeconds: 19.01, audioFile: "audio/09-closing.mp3" },
};

export const secondsToFrames = (s: number): number => Math.round(s * VIDEO.fps);
