import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 피드백 반영: Pan HR 뒤, 클로징 전 "세 축의 시너지" 장면 신규 추가
// 시나리오: Optic이 이탈 위험 발견 → Pan이 워라밸/스킬 데이터 → Agent가 재배치 안 추천

const STEPS = [
  {
    order: "01",
    tool: "Optic View",
    action: "이탈 위험군 발견",
    detail: "몰입도 하락 · 조용한 사직 후보 탐지",
    color: "#A78BFA",
    startAt: 0.3,
  },
  {
    order: "02",
    tool: "Pan HR",
    action: "워라밸·스킬 데이터 제공",
    detail: "근무 패턴 · 역량 매트릭스 연계",
    color: BRAND.colors.accentWarm,
    startAt: 3.1,
  },
  {
    order: "03",
    tool: "HR Agent",
    action: "재배치 안 추천",
    detail: "조직 적합도 기반 최적 포지션 제안",
    color: BRAND.colors.accent,
    startAt: 6.8,
  },
];

// "진단, 최적화, 실행" 10.64~13.41 → FINALE 10.5
const FINALE_AT = 10.5;

export const SynergyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const finaleFrame = FINALE_AT * fps;
  const finale = spring({ frame: frame - finaleFrame, fps, config: { damping: 18, stiffness: 90 } });

  return (
    <SceneFrame audioSrc="audio/07-synergy.mp3" background={BRAND.colors.dark.bg}>
      <div style={{
        position: "absolute",
        inset: 0,
        padding: "70px 120px",
        display: "flex",
        flexDirection: "column",
      }}>
        <SynergyHeader />

        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}>
          {STEPS.map((step, i) => (
            <>
              <Step key={step.order} step={step} />
              {i < STEPS.length - 1 && <Arrow index={i} />}
            </>
          ))}
        </div>

        <FinaleMessage progress={finale} />
      </div>
    </SceneFrame>
  );
};

const SynergyHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 110 } });
  return (
    <div style={{ textAlign: "center", opacity: reveal, marginBottom: 40 }}>
      <div style={{ fontSize: 22, color: BRAND.colors.accent, letterSpacing: 4, fontWeight: 600, marginBottom: 12 }}>
        SYNERGY
      </div>
      <div style={{ fontSize: 52, fontWeight: 800, color: BRAND.colors.dark.text, letterSpacing: -1 }}>
        진단 → 최적화 → 실행
      </div>
    </div>
  );
};

const Step: React.FC<{ step: (typeof STEPS)[number] }> = ({ step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = step.startAt * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 120 } });
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  const translateY = interpolate(reveal, [0, 1], [30, 0]);

  return (
    <div style={{
      width: 360,
      padding: "32px 28px",
      background: BRAND.colors.dark.bgElevated,
      border: `2px solid ${step.color}`,
      borderRadius: 16,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      <div style={{
        fontSize: 11,
        color: step.color,
        letterSpacing: 3,
        fontWeight: 700,
        marginBottom: 10,
      }}>
        STEP {step.order}
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        color: step.color,
        marginBottom: 14,
      }}>
        {step.tool}
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 600,
        color: BRAND.colors.dark.text,
        marginBottom: 8,
        lineHeight: 1.4,
      }}>
        {step.action}
      </div>
      <div style={{
        fontSize: 13,
        color: BRAND.colors.dark.textMuted,
        lineHeight: 1.5,
      }}>
        {step.detail}
      </div>
    </div>
  );
};

const Arrow: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appearAt = (STEPS[index + 1].startAt - 0.3) * fps;
  const reveal = spring({ frame: frame - appearAt, fps, config: { damping: 20, stiffness: 120 } });
  return (
    <div style={{
      fontSize: 56,
      color: BRAND.colors.dark.textMuted,
      fontWeight: 300,
      opacity: reveal,
      transform: `scale(${interpolate(reveal, [0, 1], [0.3, 1])})`,
    }}>
      →
    </div>
  );
};

const FinaleMessage: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div style={{
      textAlign: "center",
      marginTop: 40,
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
    }}>
      <div style={{ fontSize: 26, color: BRAND.colors.dark.textMuted }}>
        세 가지가 하나로 흐를 때,
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, color: BRAND.colors.accentWarm, marginTop: 10 }}>
        쉐막의 진짜 힘이 발휘됩니다.
      </div>
    </div>
  );
};
