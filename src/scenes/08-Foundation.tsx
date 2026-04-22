import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { CountUp } from "../components/CountUp";
import { BRAND } from "../lib/brand";

// 08 Foundation (20.11s) — v9 피드백 반영
// 02:30: 헤드라인 상단 고정 → 숫자 나올 때 위로 올라가는 애니메이션
// 02:33: CountUp sync 맞춤
// 02:48: 외양간 callback (아이콘 + 불빛 + 숫자들 모여듦)

// v9.1 실제 TTS silence 기반 sync
// silences: @7.89 (헤드라인 종료) / @12.92 (3개 숫자 종료) / @17.04 (마지막 숫자 종료)
const HEAD_AT = 0.3;
const CARDS_START = 8.3;       // was 4.5 — 헤드라인 나레이션 끝난 후 시작
const CARDS_SPACING = 2.2;     // 4×2.2 = 8.8s (TTS 8~17s와 맞춤)
const CLOSER_AT = 17.5;        // was 15 — "외양간을 만듭니다" 시점

const STATS = [
  { caption: "HR 컨설팅",          value: 1084,  suffix: "회",     countDur: 1.1 },
  { caption: "의식 설문 분석",      value: 100,   suffix: "만+ 명", countDur: 0.9 },
  { caption: "HR 데이터베이스",    value: 2400,  suffix: "만 건",  countDur: 1.2 },
  { caption: "AI 특허 출원",       value: 3,     suffix: "건",     countDur: 0.7 },
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

// v9 피드백 02:48: 외양간 callback 애니메이션 (A+B 결합)
// - 외양간 이미지 + 안에 불빛 켜지는 효과
// - 숫자들(4개)이 외양간으로 모여드는 궤적 애니메이션
const Closer: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = CLOSER_AT * fps;
  const lf = frame - start;
  const reveal = spring({ frame: lf, fps, config: { damping: 20, stiffness: 100 } });
  // 숫자들이 외양간으로 날아 들어오는 단계 (0~2s)
  const convergence = interpolate(lf, [0, 2 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 불빛 켜짐 (1.5~3s)
  const glow = interpolate(lf, [1.5 * fps, 3 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 텍스트 등장 (2s~)
  const textReveal = spring({ frame: lf - 2 * fps, fps, config: { damping: 20, stiffness: 110 } });

  // 4개 숫자의 출발점(이전 StatCard 위치 근사)과 외양간 중심(960, 540)
  const targets = [
    { x: 480,  y: 400 },  // 좌상
    { x: 1440, y: 400 },  // 우상
    { x: 480,  y: 680 },  // 좌하
    { x: 1440, y: 680 },  // 우하
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: reveal }}>
      {/* 4개 숫자 dot이 외양간으로 날아들어감 */}
      {targets.map((t, i) => {
        const progress = Math.max(0, Math.min(1, (lf / fps - 0.2 * i) / 2));
        const x = interpolate(progress, [0, 1], [t.x, 960]);
        const y = interpolate(progress, [0, 1], [t.y, 540]);
        const alpha = progress < 1 ? 1 : 0;
        const colors = [BRAND.colors.primary, BRAND.colors.accent, BRAND.colors.accentWarm, "#A78BFA"];
        return (
          <div key={i} style={{
            position: "absolute", left: x - 16, top: y - 16,
            width: 32, height: 32, borderRadius: 16,
            background: colors[i],
            boxShadow: `0 0 20px ${colors[i]}`,
            opacity: alpha * reveal,
          }}/>
        );
      })}
      {/* 외양간 아이콘 — 중앙 */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: `translate(-50%, -50%) scale(${interpolate(convergence, [0, 1], [0.6, 1])})`,
        opacity: convergence, textAlign: "center",
      }}>
        <div style={{
          fontSize: 180, lineHeight: 1,
          // 불빛이 안에서 켜지는 효과 (glow)
          filter: `drop-shadow(0 0 ${20 + glow * 40}px ${BRAND.colors.accentWarm}${Math.round(glow * 255).toString(16).padStart(2, "0")})`,
        }}>
          🏠
        </div>
        {/* 불빛 내부 파동 */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${1 + glow * 0.8})`,
          width: 80, height: 80, borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.colors.accentWarm}${Math.round(glow * 200).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}/>
      </div>
      {/* 하단 텍스트 */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 100,
        textAlign: "center",
        fontSize: 46, fontWeight: 800, color: BRAND.colors.dark.text,
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
