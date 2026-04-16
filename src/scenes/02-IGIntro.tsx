import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 02 IGIntro (13s) — 20년 → AI 더하기 → 쉐막 reveal
// 음성 (silence detection 2026-04-16):
// 0~0.84s "지난" / 1.34~4.00s "20년 인싸이트그룹은~" / 4.60~6.48s "IP 위에"
// 7.10~8.11s "AI를 더했습니다" / 8.90~10.92s "인싸이트그룹이 만든 HR AI" / 11.41~12.30s "쉐막입니다"

const IP_FRAME_AT = 0.0;
const AI_AT = 4.4;
const REVEAL_AT = 8.7;     // "INSIGHT GROUP이 만든 HR AI" + "쉐막" 같은 장면
const SHEMAK_AT = 11.0;    // "쉐막" 텍스트만 fade in (같은 화면 안에서)

export const IGIntroScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/02-ig-intro.mp3" background={BRAND.colors.dark.bg}>
      <Background />
      <HistoryPhase />
      <AIPhase />
      <BrandRevealCombined />
    </SceneFrame>
  );
};

const useTiming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

const Background: React.FC = () => (
  <div style={{
    position: "absolute",
    inset: 0,
    background: `linear-gradient(135deg, ${BRAND.colors.dark.bg} 0%, ${BRAND.colors.primary} 55%, #0F2D4A 100%)`,
  }}/>
);

const HistoryPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = IP_FRAME_AT * fps;
  const end = AI_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 110 } });
  const fadeOut = interpolate(frame, [end, end + 15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
      opacity,
      padding: "0 140px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 22, color: BRAND.colors.accent, letterSpacing: 5, fontWeight: 600 }}>
        INSIGHT GROUP
      </div>
      <div style={{ fontSize: 36, color: BRAND.colors.dark.textMuted, lineHeight: 1.6 }}>
        지난
      </div>
      <div style={{ fontSize: 160, fontWeight: 800, color: BRAND.colors.accentWarm, letterSpacing: -4, lineHeight: 1 }}>
        20년
      </div>
      <div style={{ fontSize: 32, color: BRAND.colors.dark.text, fontWeight: 500, lineHeight: 1.5 }}>
        인싸이트그룹은 한국 기업의 HR을 연구해 왔습니다.
      </div>
    </div>
  );
};

// "AI를 더했습니다" — 쾅! (scale 변화 X, 적절한 타이밍에 등장 + flash만)
const AIPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = AI_AT * fps;
  const end = REVEAL_AT * fps;
  // 1단계: "IP 위에" 부분 (4.4~7.0s) — IP 텍스트만 보임
  const ipReveal = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 110 } });
  const fadeOut = interpolate(frame, [end - 5, end + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = ipReveal * fadeOut;

  // 2단계: "AI를 더했습니다" 음성 시작 = 7.10s → 7.0s에 쾅 등장
  const impactStart = 7.0;
  const aiReveal = interpolate(frame, [impactStart * fps, impactStart * fps + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [impactStart * fps, impactStart * fps + 4, impactStart * fps + 14], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
      opacity,
      textAlign: "center",
    }}>
      {/* flash burst */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${BRAND.colors.accentWarm}AA 0%, transparent 50%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}/>
      <div style={{ fontSize: 38, color: BRAND.colors.dark.textMuted, lineHeight: 1.5 }}>
        컨설팅 현장에서 축적된 <span style={{ color: BRAND.colors.accent, fontWeight: 700 }}>IP</span> 위에,
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, color: BRAND.colors.dark.text, opacity: aiReveal }}>
        <span style={{ color: BRAND.colors.accentWarm }}>AI</span>를 더했습니다.
      </div>
    </div>
  );
};

// 한 장면에 "INSIGHT GROUP이 만든 HR AI"가 먼저 보이고, 같은 자리에 "쉐막"이 등장
// (scale/illuminate 효과 제거, opacity로 깔끔하게)
const BrandRevealCombined: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = REVEAL_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 110 } });
  const opacity = reveal;

  // "쉐막" — 같은 화면 안에서 단순 등장 (illuminate/glow X)
  const shemakStart = SHEMAK_AT * fps;
  const shemakOpacity = interpolate(frame, [shemakStart, shemakStart + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [shemakStart, shemakStart + 4, shemakStart + 14], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      opacity,
      textAlign: "center",
    }}>
      {/* 쉐막 등장 시 한순간 flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${BRAND.colors.accentWarm}99 0%, transparent 55%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}/>
      <div style={{ fontSize: 44, fontWeight: 600, color: BRAND.colors.dark.textMuted, letterSpacing: -0.5, lineHeight: 1.4 }}>
        <span style={{ color: BRAND.colors.accent, fontWeight: 800 }}>INSIGHT GROUP</span>이 만든 <span style={{ color: BRAND.colors.dark.text, fontWeight: 800 }}>HR AI</span>
      </div>
      <div style={{
        fontSize: 220,
        fontWeight: 800,
        color: BRAND.colors.dark.text,
        letterSpacing: -8,
        lineHeight: 1,
        opacity: shemakOpacity,
      }}>
        쉐막
      </div>
      <div style={{ width: 120, height: 4, background: BRAND.colors.accent, opacity: shemakOpacity }}/>
    </div>
  );
};
