import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 04 Bridge (6.09s) — v20 final
// narration_final.txt: "에이전트는 구성원 의식 패턴을 분석하는 Optic으로 더 강력해집니다."

export const BridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 첫 부분 등장: "에이전트는 구성원 의식 패턴을 분석하는"
  const introSpring = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  // Optic 강조: ~1.6s 시점에 등장
  const opticSpring = spring({ frame: frame - 1.6 * fps, fps, config: { damping: 18, stiffness: 130 } });
  // section 끝 fadeOut
  const fadeOut = interpolate(frame, [5.6 * fps, 6.09 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneFrame audioSrc="audio/04-bridge.wav" background={BRAND.colors.light.bg}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 32, padding: "0 120px",
      }}>
        <div style={{
          fontSize: 44, color: BRAND.colors.light.textMuted, textAlign: "center",
          opacity: introSpring * fadeOut,
          transform: `translateY(${interpolate(introSpring, [0, 1], [20, 0])}px)`,
          fontWeight: 500,
        }}>
          에이전트는 구성원 의식 패턴을 분석하는
        </div>
        <div style={{
          fontSize: 100, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -2,
          opacity: opticSpring * fadeOut,
          transform: `scale(${interpolate(opticSpring, [0, 1], [0.85, 1])})`,
        }}>
          <span style={{ color: BRAND.colors.primary }}>Optic</span>
          <span style={{ fontSize: 56, color: BRAND.colors.light.textMuted, fontWeight: 400 }}> 으로</span>
        </div>
        <div style={{
          fontSize: 36, color: BRAND.colors.light.textMuted, textAlign: "center",
          opacity: opticSpring * fadeOut,
          fontWeight: 500,
        }}>
          더 강력해집니다
        </div>
      </div>
    </SceneFrame>
  );
};
