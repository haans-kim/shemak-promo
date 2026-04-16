import { AbsoluteFill, Audio, staticFile } from "remotion";
import { BRAND } from "../lib/brand";

// public/audio 아래 실제 존재하는 MP3만 렌더 (오디오 미생성 시 404 방지용 가드).
const AVAILABLE_AUDIO = new Set<string>([
  "audio/01-intro.mp3",
  "audio/02-ig-intro.mp3",
  "audio/03-hr-agent.mp3",
  "audio/04-bridge.mp3",
  "audio/05-optic-view.mp3",
  "audio/06-pan-hr.mp3",
  "audio/07-synergy.mp3",
  "audio/08-foundation.mp3",
  "audio/09-closing.mp3",
]);

interface Props {
  audioSrc?: string; // "audio/02-ig-intro.mp3" — 파일 없으면 생략
  background?: string;
  children: React.ReactNode;
}

/**
 * 공통 씬 래퍼. 배경·오디오·폰트 기본값 적용.
 * audioSrc가 있고 실제 파일이 존재할 때만 <Audio> 렌더.
 * (파일 부재 시 staticFile 호출 자체는 안전하지만 렌더 시점에 404 → 호출부에서 가드)
 */
export const SceneFrame: React.FC<Props> = ({ audioSrc, background, children }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: background ?? BRAND.colors.dark.bg,
        color: BRAND.colors.dark.text,
        fontFamily: BRAND.fonts.korean,
      }}
    >
      {audioSrc && AVAILABLE_AUDIO.has(audioSrc) ? <Audio src={staticFile(audioSrc)} /> : null}
      {children}
    </AbsoluteFill>
  );
};
