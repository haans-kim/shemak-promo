import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 02 IGIntro (15.41s) — v16 narration + v18 피드백 1334#1,#2 (USER-SPECIFIED timestamps)
// 새 narration (-35dB silence):
//   0.31~4.30  : "인싸이트그룹은 오로지 인사 조직 컨설팅에만 집중해 왔습니다"
//   4.58~(9.26): "다양한 컨설팅을 통해 ~ AI 서비스를 더했습니다" (USER: 00:41.0 = 9.26s "다" 발음 끝)
//   11.26      : "인싸이트그룹이 만든" — 로고만 (USER: 00:43.0)
//   12.26      : "HR AI" 추가 (USER: 00:44.0)
//   13.26      : "쉐막입니다" 쉐막 등장 (USER: 00:45.0)

const IP_FRAME_AT = 0.0;
const AI_AT = 4.58;        // 유지 ("AI 서비스" 쾅 효과 시점)
const IMPACT_AT = 6.78;    // 유지
const REVEAL_AT = 9.26;    // 8.74 → 9.26 (USER: AI 문장 "다" 끝 timestamp)
const LOGO_AT = 11.26;     // 신설: "인싸이트그룹이 만든" 로고 등장 (USER)
const HRAI_AT = 12.26;     // 신설: "HR AI" 텍스트 추가 (USER)
const SHEMAK_AT = 13.26;   // 11.26 → 13.26 (USER: "쉐막입니다")

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
    background: `linear-gradient(135deg, ${BRAND.colors.light.bg} 0%, ${BRAND.colors.light.bgSoft} 60%, ${BRAND.colors.light.bgElevated} 100%)`,
  }}/>
);

const HistoryPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = IP_FRAME_AT * fps;
  const end = AI_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 110 } });
  // v11 #2: fadeOut 15 → 8 프레임 (전환 빠르게)
  const fadeOut = interpolate(frame, [end - 4, end + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
      <Img src={staticFile("images/insight-group-logo-text-v2.png")} style={{ height: 100, width: "auto" }} />
      <div style={{ fontSize: 54, fontWeight: 700, color: BRAND.colors.dark.text, lineHeight: 1.4, maxWidth: 1400 }}>
        <div><span style={{ color: BRAND.colors.accentWarm, fontWeight: 800 }}>오로지 인사 조직 컨설팅</span>에만</div>
        <div><span style={{ color: BRAND.colors.primary, fontWeight: 800 }}>집중</span>해 왔습니다</div>
      </div>
    </div>
  );
};

// "AI를 더했습니다" — 쾅! (scale 변화 X, 적절한 타이밍에 등장 + flash만)
const AIPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = AI_AT * fps;
  const end = REVEAL_AT * fps;
  // v11 #2: AI 진입 빠르게 — spring stiffness 110 → 160
  const ipReveal = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 160 } });
  // v18 #1: 사용자가 9.26까지 "AI 서비스" 화면 유지 원함 → fadeOut 시작을 end-5 → end로 변경
  const fadeOut = interpolate(frame, [end, end + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = ipReveal * fadeOut;

  // 2단계: "AI 서비스를 더했습니다" — 쾅 효과
  const impactStart = IMPACT_AT;  // v16: 10.7 → 6.78 (narration "AI 서비스" 시점)
  const aiReveal = interpolate(frame, [impactStart * fps, impactStart * fps + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 더 강한 flash (radial burst 2초 유지)
  const flashOpacity = interpolate(frame, [impactStart * fps - 2, impactStart * fps + 5, impactStart * fps + 25], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Scale bounce: 0 → 1.25 → 1.0
  const aiSpring = spring({ frame: frame - impactStart * fps, fps, config: { damping: 10, stiffness: 200, mass: 1 } });
  const aiScale = interpolate(aiSpring, [0, 0.5, 1], [0.3, 1.25, 1]);

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
      {/* flash burst (강화) */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${BRAND.colors.accentWarm}DD 0%, ${BRAND.colors.accentWarm}44 25%, transparent 55%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}/>
      {/* 기존 솔루션 자막 (유지) */}
      <div style={{ fontSize: 36, color: BRAND.colors.dark.textMuted, lineHeight: 1.5 }}>
        다양한 컨설팅을 통해 확보한 <span style={{ color: BRAND.colors.primary, fontWeight: 700 }}>인싸이트그룹만의 솔루션</span> 위에,
      </div>
      {/* AI 서비스를 더했습니다 — 쾅 효과 (scale bounce + overlay) */}
      <div style={{
        fontSize: 96, fontWeight: 800, color: BRAND.colors.dark.text,
        opacity: aiReveal,
        transform: `scale(${aiScale})`,
        textShadow: `0 0 40px ${BRAND.colors.accentWarm}88`,
        letterSpacing: -2,
      }}>
        <span style={{ color: BRAND.colors.accentWarm }}>AI 서비스</span>를 더했습니다.
      </div>
    </div>
  );
};

// v18 #2: 3단 순차 등장 — 로고(LOGO_AT) → HR AI(HRAI_AT) → 쉐막(SHEMAK_AT)
// 각 요소 독립 spring/opacity. wrapper는 REVEAL_AT에 초기 fade-in (배경 리셋용).
const BrandRevealCombined: React.FC = () => {
  const { frame, fps } = useTiming();
  const wrapperReveal = spring({ frame: frame - REVEAL_AT * fps, fps, config: { damping: 16, stiffness: 110 } });

  const logoReveal = spring({ frame: frame - LOGO_AT * fps, fps, config: { damping: 20, stiffness: 120 } });
  const hraiReveal = spring({ frame: frame - HRAI_AT * fps, fps, config: { damping: 20, stiffness: 120 } });
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
      opacity: wrapperReveal,
      textAlign: "center",
    }}>
      {/* 쉐막 등장 시 한순간 flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${BRAND.colors.accentWarm}99 0%, transparent 55%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}/>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* 1단: "인싸이트그룹이 만든" — 로고만 */}
        <Img src={staticFile("images/insight-group-logo-text-v2.png")} style={{ height: 140, width: "auto", opacity: logoReveal }} />
        {/* 2단: "HR AI" 나레이션 — 텍스트 추가 */}
        <div style={{ fontSize: 72, fontWeight: 700, color: BRAND.colors.dark.text, letterSpacing: -1, lineHeight: 1, opacity: hraiReveal }}>
          HR AI
        </div>
      </div>
      {/* 3단: "쉐막입니다" — 쉐막 대문자 */}
      <div style={{
        fontSize: 200,
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
