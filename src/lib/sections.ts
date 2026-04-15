// 섹션 메타데이터. duration은 TTS MP3가 생성되면 getAudioDurationInSeconds로 교체 예정.
// 현재는 수동 추정치 — 실제 오디오 생성되면 맞춰서 업데이트.

import { VIDEO } from "./brand";

export type SectionId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

export interface SectionMeta {
  id: SectionId;
  slug: string;
  title: string;
  estimatedSeconds: number;
  audioFile: string; // audio/ 하위 경로
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  "01": { id: "01", slug: "01-intro",       title: "Intro",        estimatedSeconds: 22, audioFile: "audio/01-intro.mp3" },
  "02": { id: "02", slug: "02-ig-intro",    title: "IG 소개",      estimatedSeconds: 21, audioFile: "audio/02-ig-intro.mp3" },
  "03": { id: "03", slug: "03-hr-agent",    title: "HR Agent",     estimatedSeconds: 65, audioFile: "audio/03-hr-agent.mp3" },
  "04": { id: "04", slug: "04-bridge",      title: "Bridge",       estimatedSeconds: 15, audioFile: "audio/04-bridge.mp3" },
  "05": { id: "05", slug: "05-optic-view",  title: "Optic View",   estimatedSeconds: 45, audioFile: "audio/05-optic-view.mp3" },
  "06": { id: "06", slug: "06-pan-hr",      title: "Pan HR",       estimatedSeconds: 40, audioFile: "audio/06-pan-hr.mp3" },
  "07": { id: "07", slug: "07-closing",     title: "Closing",      estimatedSeconds: 15, audioFile: "audio/07-closing.mp3" },
};

export const secondsToFrames = (s: number): number => Math.round(s * VIDEO.fps);
