import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 04 Bridge (4.96s) — 1줄로 대폭 축소
// "에이전트는 구성원 의식 패턴을 분석하는 Optic으로 더 강력해집니다."

export const BridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introSpring = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const optic = spring({ frame: frame - 1.5 * fps, fps, config: { damping: 18, stiffness: 130 } });
  const fadeOut = interpolate(frame, [4.5 * fps, 4.96 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneFrame audioSrc="audio/04-bridge.mp3" background={BRAND.colors.light.bg}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 32, padding: "0 120px",
      }}>
        {/* 앞부분 텍스트 */}
        <div style={{
          fontSize: 44, color: BRAND.colors.light.textMuted, textAlign: "center",
          opacity: introSpring * fadeOut,
          transform: `translateY(${interpolate(introSpring, [0, 1], [20, 0])}px)`,
          fontWeight: 500,
        }}>
          에이전트는 구성원 의식 패턴을 분석하는
        </div>
        {/* Optic 강조 */}
        <div style={{
          fontSize: 100, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -2,
          opacity: optic * fadeOut,
          transform: `scale(${interpolate(optic, [0, 1], [0.85, 1])})`,
        }}>
          <span style={{ color: BRAND.colors.primary }}>Optic</span>
          <span style={{ fontSize: 56, color: BRAND.colors.light.textMuted, fontWeight: 400 }}> 으로</span>
        </div>
        <div style={{
          fontSize: 36, color: BRAND.colors.light.textMuted, textAlign: "center",
          opacity: optic * fadeOut,
          fontWeight: 500,
        }}>
          더 강력해집니다
        </div>
      </div>
    </SceneFrame>
  );
};
