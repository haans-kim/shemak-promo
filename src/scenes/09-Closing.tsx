import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 09 Closing (27s)
// 음성 분석 (silence detection 2026-04-16):
// 0.46~3.60 "HR 에이전트는 TF 대체 X" / 4.54~6.46 "VALUE를 더합니다"
// 7.49~10.65 "데모 요청" / 11.13~14.90 "PoC" / 15.33~18.96 "진단 요청"
// 19.57~24.44 "소규모~데이터로 읽다" / 25.07~25.63 "인싸이트그룹, 쉐막"

const T_VALUE_START  = 0.3;
const T_CTA_START    = 7.0;
const T_SCALE_START  = 19.0;
const T_SLOGAN_START = 23.5; // 피드백 #11: 마지막 슬로건 화면이 늦게 등장 → 1초 앞당김

const CTAS = [
  { icon: "▶", label: "데모 요청", desc: "30분이면 우리 조직에 맞는지 확인" },
  { icon: "⚙", label: "PoC",       desc: "특정 모듈을 골라 2주 안에 결과 검증" },
  { icon: "✦", label: "진단 요청", desc: "데이터 준비 상태와 우선 과제 정리" },
];

export const ClosingScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/09-closing.mp3" background={BRAND.colors.dark.bg}>
      <ValueBlock />
      <CtaBlock />
      <ScaleBlock />
      <SloganBlock />
    </SceneFrame>
  );
};

const useSceneTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

// 피드백 #10: "VALUE를 더합니다" 쾅! 강조 효과
const ValueBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_VALUE_START * fps;
  const endFrame = T_CTA_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [endFrame - 15, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  // VALUE 음성 시작 = 4.54s → 4.4s에 쾅 등장 (scale 변화 X, 단순 opacity + flash)
  const impactStart = 4.4;
  const valueOpacity = interpolate(frame, [impactStart * fps, impactStart * fps + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [impactStart * fps, impactStart * fps + 4, impactStart * fps + 14], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
      opacity,
    }}>
      {/* flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${BRAND.colors.accentWarm}AA 0%, transparent 55%)`,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}/>
      <div style={{
        fontSize: 28,
        color: BRAND.colors.dark.textSubtle,
        textDecoration: "line-through",
        textDecorationThickness: 2,
      }}>
        HR TF를 대체하는 것이 아닙니다.
      </div>
      <div style={{
        fontSize: 64,
        fontWeight: 800,
        color: BRAND.colors.dark.text,
        textAlign: "center",
        lineHeight: 1.3,
        letterSpacing: -1,
      }}>
        리더의 의사결정에,<br />
        <span style={{
          color: BRAND.colors.accentWarm,
          display: "inline-block",
          opacity: valueOpacity,
        }}>VALUE를 더합니다</span>
      </div>
    </div>
  );
};

const CtaBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_CTA_START * fps;
  const endFrame = T_SCALE_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 100 } });
  const fadeOut = interpolate(frame, [endFrame - 15, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      padding: "80px 140px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity,
    }}>
      <div style={{
        fontSize: 24,
        color: BRAND.colors.dark.textMuted,
        marginBottom: 40,
        fontWeight: 500,
      }}>
        지금, 다음 스텝을 선택하세요
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 28,
        width: "100%",
        maxWidth: 1400,
      }}>
        {CTAS.map((cta, i) => (
          <CtaCard key={cta.label} cta={cta} delay={i * 4.0} />
        ))}
      </div>
    </div>
  );
};

interface CtaCardProps { cta: (typeof CTAS)[number]; delay: number; }

const CtaCard: React.FC<CtaCardProps> = ({ cta, delay }) => {
  const { frame, fps } = useSceneTime();
  const base = T_CTA_START + delay;
  const reveal = spring({ frame: frame - base * fps, fps, config: { damping: 22, stiffness: 110 } });
  return (
    <div style={{
      padding: "36px 30px",
      background: BRAND.colors.dark.bgElevated,
      border: `1px solid ${BRAND.colors.dark.border}`,
      borderRadius: 16,
      opacity: reveal,
      transform: `translateY(${interpolate(reveal, [0, 1], [24, 0])}px)`,
      minHeight: 220,
    }}>
      <div style={{
        fontSize: 36,
        color: BRAND.colors.accent,
        marginBottom: 18,
      }}>
        {cta.icon}
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 700,
        color: BRAND.colors.dark.text,
        marginBottom: 12,
      }}>
        {cta.label}
      </div>
      <div style={{
        fontSize: 15,
        color: BRAND.colors.dark.textMuted,
        lineHeight: 1.6,
      }}>
        {cta.desc}
      </div>
    </div>
  );
};

const ScaleBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_SCALE_START * fps;
  const endFrame = T_SLOGAN_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [endFrame - 12, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 18,
      opacity,
    }}>
      <div style={{ fontSize: 20, color: BRAND.colors.dark.textMuted, fontWeight: 400 }}>
        모든 규모의 조직을 위해
      </div>
      <div style={{
        fontSize: 46,
        fontWeight: 800,
        color: BRAND.colors.dark.text,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <span>소규모 벤처</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 38 }}>→</span>
        <span>중견기업</span>
        <span style={{ color: BRAND.colors.accent, fontSize: 38 }}>→</span>
        <span>대기업</span>
      </div>
    </div>
  );
};

const SloganBlock: React.FC = () => {
  const { frame, fps } = useSceneTime();
  const startFrame = T_SLOGAN_START * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 100 } });
  const brand = spring({ frame: frame - (T_SLOGAN_START + 1.2) * fps, fps, config: { damping: 20, stiffness: 100 } });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 36,
      opacity: reveal,
    }}>
      <div style={{
        fontSize: 72,
        fontWeight: 800,
        color: BRAND.colors.dark.text,
        letterSpacing: -2,
        textAlign: "center",
        transform: `scale(${interpolate(reveal, [0, 1], [0.9, 1])})`,
      }}>
        데이터로, <span style={{ color: BRAND.colors.accent }}>조직을 읽다</span>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: brand,
      }}>
        <div style={{ fontSize: 22, color: BRAND.colors.dark.textMuted }}>인싸이트그룹</div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.colors.accent }}/>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 3, color: BRAND.colors.dark.text }}>
          쉐막
        </div>
      </div>
      <div style={{
        position: "absolute",
        bottom: 40,
        fontSize: 12,
        color: BRAND.colors.dark.textSubtle,
        letterSpacing: 1,
        opacity: brand,
      }}>
        www.insightgroup.co.kr · +82-2-3404-9500
      </div>
    </div>
  );
};
