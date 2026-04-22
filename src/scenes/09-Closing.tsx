import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 09 Closing (16.01s) — v13: -40dB 정밀 silence 기반 narration 싱크 재조정
// 실제 narration 구간:
//   0.20 ~ 1.44s  : "인사는 결국 사람이 합니다"
//   1.75 ~ 3.68s  : "다만 HR AI는 VALUE를 더합니다"
//   4.03 ~ 7.82s  : "소규모 벤처부터 중견기업 대기업까지"
//   8.08 ~ 10.95s : "데이터로 조직을 해석합니다"   ← v12에서 9.0s로 잡아 1s 늦었음
//   11.27 ~ 13.36s: "인싸이트그룹 쉐막입니다"
//   13.66+        : Contact

const T_VALUE_START   = 0.1;
const T_SCALE_START   = 4.0;    // narration 4.03
const T_BRAND_START   = 8.0;    // narration 8.08 ⭐ 핵심
const T_CONTACT_START = 13.4;   // narration 13.66 - 0.26s (spring fade 감안)

export const ClosingScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/09-closing.mp3" background={BRAND.colors.light.bg}>
      <ValueBlock />
      <ScaleBlock />
      <BrandBlock />
      <ContactBlock />
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
  const endFrame = T_SCALE_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [endFrame - 15, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  // v13: 2번째 줄 "HR AI는 VALUE를 더합니다" — narration 1.75~3.68 정확히
  const valueStart = 1.75;
  const valueReveal = interpolate(frame, [valueStart * fps, valueStart * fps + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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

// 규모 스펙트럼 전용 블록
const ScaleBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_SCALE_START * fps;
  const endFrame = T_BRAND_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [endFrame - 12, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24, opacity,
    }}>
      <div style={{ fontSize: 22, color: BRAND.colors.light.textMuted, fontWeight: 400 }}>
        모든 규모의 조직을 위해
      </div>
      <div style={{
        fontSize: 48, fontWeight: 700, color: BRAND.colors.light.text,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <span>소규모 벤처</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 36 }}>→</span>
        <span>중견기업</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 36 }}>→</span>
        <span>대기업</span>
      </div>
    </div>
  );
};

// 메인 슬로건 + 인싸이트그룹 쉐막입니다
const BrandBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_BRAND_START * fps;
  const endFrame = T_CONTACT_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 100 } });
  const fadeOut = interpolate(frame, [endFrame - 10, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  // v13.1: "인싸이트그룹 쉐막" signature — narration 11.27에 정확히 보이도록 (spring fade 0.3s 감안 11.0s 시작)
  const brandReveal = spring({ frame: frame - (T_BRAND_START + 3.0) * fps, fps, config: { damping: 18, stiffness: 100 } });
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 40, opacity,
    }}>
      <div style={{
        fontSize: 68, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -2,
        textAlign: "center",
        transform: `scale(${interpolate(reveal, [0, 1], [0.88, 1])})`,
      }}>
        데이터로, <span style={{ color: BRAND.colors.primary }}>조직을 해석합니다</span>
      </div>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 20, opacity: brandReveal,
      }}>
        <div style={{ fontSize: 32, color: BRAND.colors.light.textMuted, fontWeight: 500 }}>인싸이트그룹</div>
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 2, color: BRAND.colors.light.text }}>
          쉐막
        </div>
      </div>
    </div>
  );
};

// 컨택 포인트 — 마지막 장면
const ContactBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_CONTACT_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 30,
      opacity: reveal,
    }}>
      <div style={{ fontSize: 24, color: BRAND.colors.light.textMuted, letterSpacing: 2 }}>
        Contact
      </div>
      <div style={{
        padding: "20px 48px",
        background: BRAND.colors.light.bgElevated,
        border: `2px solid ${BRAND.colors.primary}`,
        borderRadius: 14,
        fontSize: 40, color: BRAND.colors.primary, fontWeight: 700,
        letterSpacing: 1,
        transform: `scale(${interpolate(reveal, [0, 1], [0.85, 1])})`,
      }}>
        📧 shemak@insightgroup.co.kr
      </div>
    </div>
  );
};
