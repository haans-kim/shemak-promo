import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { CountUp } from "../components/CountUp";
import { BRAND } from "../lib/brand";

// 피드백 반영 (Q2 = A):
// 02-IGIntro에서 숫자 빼고, 클로징 직전 이 장면에서 임팩트 있게 배치.
// "이 모든 기능의 기반" 메시지 + 카운트업 4종 + "쉐막의 AI를 만듭니다" 클로저.

// 음성 분석 기반: "기반에는 20년" 0~3.09 / 숫자 4개 3.70~11.43 / "쉐막의 AI" 12.07~14.39
const HEAD_AT = 0.3;
const CARDS_START = 3.7;
const CARDS_SPACING = 1.95; // 4카드 × 1.95s = 7.8s (음성 7.7s 커버)
const CLOSER_AT = 12.0;

const STATS = [
  { caption: "누적 컨설팅",        value: 1084,  suffix: "회",     countDur: 1.1 },
  { caption: "조직 진단 데이터",    value: 100,   suffix: "만+ 명", countDur: 0.9 },
  { caption: "HR 데이터베이스",    value: 2400,  suffix: "만 건",  countDur: 1.2 },
  { caption: "AI 특허",           value: 3,     suffix: "건",     countDur: 0.7 },
];

export const FoundationScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/08-foundation.mp3" background={BRAND.colors.dark.bg}>
      <Background />
      <Headline />
      <StatsGrid />
      <Closer />
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
    background: `radial-gradient(ellipse at center, ${BRAND.colors.primary} 0%, ${BRAND.colors.dark.bg} 70%)`,
  }}/>
);

const Headline: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = HEAD_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 100 } });
  const closerStart = CLOSER_AT * fps;
  const fadeOut = interpolate(frame, [closerStart - 20, closerStart], [1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute",
      top: 100,
      left: 0,
      right: 0,
      textAlign: "center",
      opacity,
    }}>
      <div style={{ fontSize: 24, color: BRAND.colors.accent, letterSpacing: 4, fontWeight: 600, marginBottom: 14 }}>
        FOUNDATION
      </div>
      <div style={{ fontSize: 54, fontWeight: 800, color: BRAND.colors.dark.text, lineHeight: 1.3, letterSpacing: -1 }}>
        이 모든 기능의 <span style={{ color: BRAND.colors.accentWarm }}>기반</span>에는,
      </div>
      <div style={{ fontSize: 32, color: BRAND.colors.dark.textMuted, marginTop: 14 }}>
        20년의 컨설팅 기록이 있습니다.
      </div>
    </div>
  );
};

const StatsGrid: React.FC = () => {
  const { frame, fps } = useTiming();
  const closerStart = CLOSER_AT * fps;
  const fadeOut = interpolate(frame, [closerStart - 15, closerStart + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: fadeOut,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 60,
        marginTop: 40,
      }}>
        {STATS.map((s, i) => (
          <StatCard key={s.caption} {...s} startAt={CARDS_START + i * CARDS_SPACING} />
        ))}
      </div>
    </div>
  );
};

interface StatProps {
  caption: string;
  value: number;
  suffix: string;
  countDur: number;
  startAt: number;
}

const StatCard: React.FC<StatProps> = ({ caption, value, suffix, countDur, startAt }) => {
  const { frame, fps } = useTiming();
  const revealFrame = startAt * fps - 8;
  const reveal = spring({ frame: frame - revealFrame, fps, config: { damping: 18, stiffness: 130, mass: 0.8 } });
  const translateY = interpolate(reveal, [0, 1], [24, 0]);
  return (
    <div style={{
      opacity: reveal,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 14,
    }}>
      <div style={{ fontSize: 24, color: BRAND.colors.dark.textMuted, letterSpacing: 1, fontWeight: 500 }}>
        {caption}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 100, fontWeight: 800, color: BRAND.colors.accent, letterSpacing: -3, lineHeight: 1 }}>
          <CountUp from={0} to={value} durationInSeconds={countDur} startAtSeconds={startAt} />
        </div>
        <div style={{ fontSize: 36, color: BRAND.colors.dark.text, fontWeight: 500 }}>{suffix}</div>
      </div>
    </div>
  );
};

const Closer: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = CLOSER_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 100 } });
  const translateY = interpolate(reveal, [0, 1], [30, 0]);
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: reveal,
      transform: `translateY(${translateY}px)`,
    }}>
      <div style={{
        fontSize: 64,
        fontWeight: 800,
        color: BRAND.colors.dark.text,
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        이 데이터가, <br />
        <span style={{ color: BRAND.colors.accent }}>쉐막의 AI를 만듭니다.</span>
      </div>
    </div>
  );
};
