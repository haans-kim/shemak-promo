import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 09 Closing (16.01s) — v10: 후반 화면 빠름 피드백 (02:49/55/58/03:03)
// 각 블록 transition 부드럽게, BRAND 더 길게, CONTACT 별도 장면화

const T_VALUE_START   = 0.3;
const T_SCALE_START   = 6.0;    // 7.0 → 6.0 (VALUE 1초 단축, SCALE에 시간 더)
const T_BRAND_START   = 9.5;    // 10.2 → 9.5 (BRAND 진입 빠르게, 체류 길게)
const T_CONTACT_START = 14.0;   // 13.2 → 14.0 (BRAND "쉐막입니다" 충분히 보여준 후 contact)

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

  // v10: snap 너무 빠름 → 0.5s smooth fade (15 frames)
  const valueStart = 3.9;
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
  const brandReveal = spring({ frame: frame - (T_BRAND_START + 1.2) * fps, fps, config: { damping: 18, stiffness: 100 } });
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
        display: "flex", alignItems: "center", gap: 16, opacity: brandReveal,
      }}>
        <div style={{ fontSize: 24, color: BRAND.colors.light.textMuted }}>인싸이트그룹</div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.colors.primary }}/>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 3, color: BRAND.colors.light.text }}>
          쉐막입니다
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
