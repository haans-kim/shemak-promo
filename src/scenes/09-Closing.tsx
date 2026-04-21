import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 09 Closing (16.01s) — 2026-04-21 최종
// 0~6s   "인사는 결국 사람이 합니다. 다만 HR AI는 의사 결정에 밸류를 더합니다."
// 7~16s  "소규모 벤처부터 ... 데이터로, 조직을 해석합니다. 인싸이트그룹, 쉐막입니다." + 컨택

const T_VALUE_START  = 0.3;
const T_FINAL_START  = 7.5;
const T_BRAND_START  = 12.0;

export const ClosingScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/09-closing.mp3" background={BRAND.colors.light.bg}>
      <ValueBlock />
      <FinalBlock />
    </SceneFrame>
  );
};

const useSceneTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

// "인사는 결국 사람이 합니다 / HR AI는 밸류를 더합니다"
const ValueBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_VALUE_START * fps;
  const endFrame = T_FINAL_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [endFrame - 15, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  const valueStart = 3.8;
  const valueReveal = interpolate(frame, [valueStart * fps, valueStart * fps + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24, opacity, textAlign: "center",
    }}>
      <div style={{ fontSize: 52, fontWeight: 700, color: BRAND.colors.light.text, letterSpacing: -1 }}>
        인사는 결국 <span style={{ color: BRAND.colors.primary, fontWeight: 800 }}>사람</span>이 합니다.
      </div>
      <div style={{
        fontSize: 44, fontWeight: 500, color: BRAND.colors.light.textMuted,
        marginTop: 16, opacity: valueReveal,
      }}>
        다만 <span style={{ color: BRAND.colors.accentWarm, fontWeight: 800 }}>HR AI</span>는
        의사 결정에 <span style={{ color: BRAND.colors.accentWarm, fontWeight: 800 }}>VALUE</span>를 더합니다.
      </div>
    </div>
  );
};

// "소규모 벤처~대기업까지 / 데이터로, 조직을 해석합니다 / 인싸이트그룹, 쉐막" + 이메일
const FinalBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_FINAL_START * fps;
  const brandFrame = T_BRAND_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const brand = spring({ frame: frame - brandFrame, fps, config: { damping: 18, stiffness: 100 } });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 28, opacity: reveal, padding: "60px",
    }}>
      {/* 규모 스펙트럼 */}
      <div style={{ fontSize: 20, color: BRAND.colors.light.textMuted, fontWeight: 400 }}>
        모든 규모의 조직을 위해
      </div>
      <div style={{
        fontSize: 40, fontWeight: 700, color: BRAND.colors.light.text,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span>소규모 벤처</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 32 }}>→</span>
        <span>중견기업</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 32 }}>→</span>
        <span>대기업</span>
      </div>
      {/* 메인 슬로건 */}
      <div style={{
        fontSize: 68, fontWeight: 800, color: BRAND.colors.light.text,
        letterSpacing: -2, textAlign: "center", marginTop: 20,
        transform: `scale(${interpolate(brand, [0, 1], [0.9, 1])})`,
        opacity: brand,
      }}>
        데이터로, <span style={{ color: BRAND.colors.primary }}>조직을 해석합니다</span>
      </div>
      {/* 브랜드 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, opacity: brand,
      }}>
        <div style={{ fontSize: 22, color: BRAND.colors.light.textMuted }}>인싸이트그룹</div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.colors.primary }}/>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 3, color: BRAND.colors.light.text }}>
          쉐막
        </div>
      </div>
      {/* 이메일 컨택 */}
      <div style={{
        marginTop: 30,
        padding: "12px 24px",
        background: BRAND.colors.light.bgElevated,
        border: `1px solid ${BRAND.colors.light.border}`,
        borderRadius: 10,
        fontSize: 22, color: BRAND.colors.primary, fontWeight: 600,
        letterSpacing: 0.5,
        opacity: brand,
      }}>
        📧 shemak@insightgroup.co.kr
      </div>
    </div>
  );
};
