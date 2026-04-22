import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { CountUp } from "../components/CountUp";
import { Barn } from "../components/Barn";
import { BRAND } from "../lib/brand";

// 08 Foundation (20.11s) — v9 피드백 반영
// 02:30: 헤드라인 상단 고정 → 숫자 나올 때 위로 올라가는 애니메이션
// 02:33: CountUp sync 맞춤
// 02:48: 외양간 callback (아이콘 + 불빛 + 숫자들 모여듦)

// v10: "HR 컨설팅" 화면 전환 빠르게 (02:35 피드백) → CARDS 약간 앞당김
const HEAD_AT = 0.3;
const CARDS_START = 7.5;       // 8.3 → 7.5 (HR 컨설팅 카드 빠르게 등장)
const CARDS_SPACING = 2.3;     // 4×2.3 = 9.2s (16.7s까지)
const CLOSER_AT = 17.0;        // 17.5 → 17.0 (외양간 애니메이션 시간 확보)

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

// v10 옵션 F: 위험 키워드 둥둥 떠다님 → 뽕! 터짐 → 외양간만 남음
// 외양간 = 01 콜백 (Barn 컴포넌트)
// 타이밍 (CLOSER 17.5~20.1, 약 2.6s):
//  0~1.0s: 외양간 + 위험 키워드 6개 떠다님
//  1.0~1.4s: 외양간 글로우 빌드업
//  1.4~1.7s: 뽕! 키워드 동시 터짐
//  1.7~2.6s: 외양간만 남고 텍스트
const Closer: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = CLOSER_AT * fps;
  const lf = frame - start;
  const reveal = spring({ frame: lf, fps, config: { damping: 20, stiffness: 100 } });

  // 단계별 진행도
  const floatStart = 0;                 // 위험 떠다님 시작
  const popMoment = 1.4 * fps;          // 뽕!
  const glowProgress = interpolate(lf, [0.8 * fps, 1.4 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const popProgress = interpolate(lf, [popMoment, popMoment + 0.3 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textReveal = spring({ frame: lf - 1.7 * fps, fps, config: { damping: 20, stiffness: 110 } });

  // 위험 키워드 6개 (외양간 주변 둥둥 떠다님)
  const RISKS = [
    { txt: "이탈",     baseX: -380, baseY: -180 },
    { txt: "번아웃",   baseX:  380, baseY: -200 },
    { txt: "퇴직",     baseX: -440, baseY:   30 },
    { txt: "갈등",     baseX:  440, baseY:   50 },
    { txt: "스트레스", baseX: -340, baseY:  220 },
    { txt: "불만",     baseX:  340, baseY:  240 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: reveal }}>
      {/* 외양간 — 중앙, glow 동기화 */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
      }}>
        <Barn width={500} cowVisible={true} showFence={true} glow={glowProgress} />
      </div>

      {/* 위험 키워드 — 둥둥 떠다니다 뽕! */}
      {RISKS.map((r, i) => {
        // 부드러운 floating (sine motion)
        const t = lf / fps;
        const floatX = r.baseX + Math.sin(t * 1.5 + i) * 12;
        const floatY = r.baseY + Math.cos(t * 1.2 + i * 0.7) * 10;

        // 뽕! 직전까지는 visible, 후 터지면서 사라짐
        const opacity = lf < popMoment ? 1 : Math.max(0, 1 - popProgress * 1.5);
        const scale = lf < popMoment
          ? 1
          : interpolate(popProgress, [0, 0.3, 1], [1, 1.6, 0]);

        return (
          <div key={i}>
            {/* 키워드 버블 */}
            <div style={{
              position: "absolute",
              left: `calc(50% + ${floatX}px)`,
              top: `calc(50% + ${floatY}px)`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              padding: "10px 22px",
              background: "#FEE2E2",
              border: `3px solid ${BRAND.colors.accentWarm}`,
              borderColor: "#DC2626",
              borderRadius: 24,
              fontSize: 28, fontWeight: 800, color: "#DC2626",
              whiteSpace: "nowrap",
              transition: "transform 0.2s",
            }}>
              {r.txt}
            </div>
            {/* 뽕! 파편 (터질 때만) */}
            {lf >= popMoment && popProgress < 1 && (
              <>
                {[0, 60, 120, 180, 240, 300].map(angle => {
                  const rad = (angle * Math.PI) / 180;
                  const dist = 50 * popProgress;
                  return (
                    <div key={angle} style={{
                      position: "absolute",
                      left: `calc(50% + ${floatX + Math.cos(rad) * dist}px)`,
                      top: `calc(50% + ${floatY + Math.sin(rad) * dist}px)`,
                      transform: "translate(-50%, -50%)",
                      width: 8, height: 8, borderRadius: 4,
                      background: "#DC2626",
                      opacity: 1 - popProgress,
                    }}/>
                  );
                })}
              </>
            )}
          </div>
        );
      })}

      {/* "뽕!" 강조 — 매우 짧게 (1.4~1.7s) */}
      {lf >= popMoment && lf < popMoment + 0.5 * fps && (
        <div style={{
          position: "absolute", left: "50%", top: "30%",
          transform: `translate(-50%, -50%) scale(${interpolate(popProgress, [0, 0.5, 1], [0.5, 1.4, 1])})`,
          fontSize: 80, fontWeight: 900, color: "#DC2626",
          opacity: 1 - popProgress,
          textShadow: "0 0 30px rgba(220,38,38,0.6)",
        }}>
          💥 뽕!
        </div>
      )}

      {/* 마무리 텍스트 (1.7s~) */}
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
