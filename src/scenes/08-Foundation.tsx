import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { CountUp } from "../components/CountUp";
import { BarnImage } from "../components/BarnImage";
import { BRAND } from "../lib/brand";

// 08 Foundation (20.11s) — v9 피드백 반영
// 02:30: 헤드라인 상단 고정 → 숫자 나올 때 위로 올라가는 애니메이션
// 02:33: CountUp sync 맞춤
// 02:48: 외양간 callback (아이콘 + 불빛 + 숫자들 모여듦)

// v11 #7,#8: 02:51/02:54 카드 전환 너무 빠름 → 카드 등장 간격 + CountUp 느리게
const HEAD_AT = 0.3;
const CARDS_START = 7.5;
const CARDS_SPACING = 2.4;     // 2.3 → 2.4 (조금 여유 — CLOSER_AT 손대지 않는 선)
const CLOSER_AT = 17.0;

const STATS = [
  { caption: "HR 컨설팅",          value: 1084,  suffix: "회",     countDur: 1.7 },  // 1.1 → 1.7
  { caption: "의식 설문 분석",      value: 100,   suffix: "만+ 명", countDur: 1.4 },  // 0.9 → 1.4
  { caption: "HR 데이터베이스",    value: 2400,  suffix: "만 건",  countDur: 1.8 },  // 1.2 → 1.8
  { caption: "AI 특허 출원",       value: 3,     suffix: "건",     countDur: 1.0 },  // 0.7 → 1.0
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
    background: `radial-gradient(ellipse at center, ${BRAND.colors.light.bgSoft} 0%, ${BRAND.colors.light.bg} 70%)`,
  }}/>
);

const Headline: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = HEAD_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 100 } });
  const closerStart = CLOSER_AT * fps;
  const fadeOut = interpolate(frame, [closerStart - 20, closerStart], [1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  // v9 피드백 02:30: 처음엔 중앙에 있다가 숫자 나올 때(CARDS_START) 위로 올라감
  const moveUpStart = (CARDS_START - 0.5) * fps;
  const moveUp = interpolate(frame, [moveUpStart, moveUpStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // top: 중앙(400) → 상단(80)
  const topPx = interpolate(moveUp, [0, 1], [360, 80]);
  const fontScale = interpolate(moveUp, [0, 1], [1.15, 1]);
  return (
    <div style={{
      position: "absolute",
      top: topPx,
      left: 0,
      right: 0,
      textAlign: "center",
      opacity,
      transform: `scale(${fontScale})`,
    }}>
      <div style={{ fontSize: 24, color: BRAND.colors.primary, letterSpacing: 4, fontWeight: 600, marginBottom: 14 }}>
        FOUNDATION
      </div>
      <div style={{ fontSize: 50, fontWeight: 800, color: BRAND.colors.dark.text, lineHeight: 1.3, letterSpacing: -1 }}>
        이 많은 <span style={{ color: BRAND.colors.primary }}>AI 모듈</span>들 <span style={{ color: BRAND.colors.accentWarm }}>기반</span>에는,
      </div>
      <div style={{ fontSize: 30, color: BRAND.colors.dark.textMuted, marginTop: 14 }}>
        인싸이트 그룹 20년 컨설팅 결과가 있습니다.
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
  const revealFrame = startAt * fps - 10;
  // v11: spring 부드럽게 — stiffness 130 → 90, damping 22 (pop이 아닌 ease-in)
  const reveal = spring({ frame: frame - revealFrame, fps, config: { damping: 22, stiffness: 90, mass: 1 } });
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
        {/* 피드백 #15: 자릿수 변경 시 정렬 틀어짐 → 최종값 자릿수 기준 고정폭(tabular-nums + minWidth) */}
        <div style={{
          fontSize: 100, fontWeight: 800, color: BRAND.colors.primary,
          letterSpacing: -3, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          minWidth: `${String(value).length * 60}px`,
          textAlign: "right",
        }}>
          <CountUp from={0} to={value} durationInSeconds={countDur} startAtSeconds={startAt} />
        </div>
        <div style={{ fontSize: 36, color: BRAND.colors.dark.text, fontWeight: 500 }}>{suffix}</div>
      </div>
    </div>
  );
};

// v17: 위험 키워드 제거, 실사 외양간 PNG + 주황 glow pulse로 단순화
// 타이밍 (CLOSER 17.0~20.1, 약 3.1s):
//   0~1.0s: 외양간 fade-scale entrance + glow breathe 시작
//   1.2s~ : 마무리 텍스트 등장
const Closer: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = CLOSER_AT * fps;
  const lf = frame - start;
  const reveal = spring({ frame: lf, fps, config: { damping: 20, stiffness: 100 } });
  const textReveal = spring({ frame: lf - 1.2 * fps, fps, config: { damping: 20, stiffness: 110 } });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: reveal }}>
      {/* 외양간 실사 PNG + glow B (상시 breathe) */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
      }}>
        {/* v18 #5: "외양간을 만듭니다" 텍스트 등장 시점 glow 피크 burst */}
        <div style={{
          position: "absolute", inset: "-30%",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.85) 0%, rgba(245,158,11,0.40) 35%, transparent 70%)",
          filter: "blur(40px)",
          opacity: textReveal * 0.9,
          transform: `scale(${0.9 + textReveal * 0.3})`,
          zIndex: 0,
        }}/>
        <BarnImage width={620} startAt={CLOSER_AT + 0.3} entrance="fade-scale" glow />
      </div>

      {/* 마무리 텍스트 */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center",
        fontSize: 50, fontWeight: 800, color: BRAND.colors.dark.text,
        lineHeight: 1.3,
        opacity: textReveal,
        transform: `translateY(${interpolate(textReveal, [0, 1], [20, 0])}px)`,
      }}>
        이 데이터들이 <span style={{ color: BRAND.colors.primary }}>HR AI 쉐막</span>,
        <span style={{ color: BRAND.colors.accentWarm }}> 외양간</span>을 만듭니다.
      </div>
    </div>
  );
};
