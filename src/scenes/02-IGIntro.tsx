import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "../components/CountUp";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// Typecast 오디오 실측 20.80s. 자연스러운 한국어 페이스 기준 음절 비례 추정.
// Studio 웨이브폼으로 실측해 미세조정 권장.
// 숫자 단축: "백만" → "100만", "이천사백만" → "2,400만" (카운트업 값은 만 단위).

const CARDS = [
  { caption: "누적 컨설팅",     value: 1084, suffix: "회",     startAt: 3.2,  countDuration: 1.0 },
  { caption: "의식 데이터",     value: 100,  suffix: "만 명",   startAt: 5.5,  countDuration: 0.8 },
  { caption: "Foundation DB",  value: 2400, suffix: "만 건",   startAt: 8.0,  countDuration: 1.2 },
  { caption: "AI 특허",         value: 3,    suffix: "건",     startAt: 12.0, countDuration: 0.6 },
];

const GRID_FADEOUT_AT = 15.5;
const BRAND_REVEAL_AT = 16.5;

const SceneBackground: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(135deg, #0A1628 0%, ${BRAND.colors.primary} 55%, #0F2D4A 100%)`,
    }}
  />
);

interface CardProps {
  caption: string;
  value: number;
  suffix: string;
  startAt: number;
  countDuration: number;
}

const StatCard: React.FC<CardProps> = ({ caption, value, suffix, startAt, countDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = startAt * fps - 8;
  const reveal = spring({ frame: frame - revealFrame, fps, config: { damping: 18, stiffness: 140, mass: 0.8 } });

  const fadeOutFrame = GRID_FADEOUT_AT * fps;
  const gridOut = interpolate(frame, [fadeOutFrame, fadeOutFrame + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = reveal * gridOut;
  const translateY = interpolate(reveal, [0, 1], [24, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", letterSpacing: 1, fontWeight: 500 }}>
        {caption}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 110, fontWeight: 700, color: BRAND.colors.accent, letterSpacing: -3, lineHeight: 1 }}>
          <CountUp from={0} to={value} durationInSeconds={countDuration} startAtSeconds={startAt} />
        </div>
        <div style={{ fontSize: 42, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{suffix}</div>
      </div>
    </div>
  );
};

const TitleBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 120 } });
  const fadeOutFrame = GRID_FADEOUT_AT * fps;
  const gridOut = interpolate(frame, [fadeOutFrame, fadeOutFrame + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = reveal * gridOut;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, opacity, paddingRight: 20, wordBreak: "keep-all" }}>
      <div style={{ fontSize: 24, color: BRAND.colors.accent, letterSpacing: 4, fontWeight: 600 }}>
        INSIGHT GROUP
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, color: BRAND.colors.paper, lineHeight: 1.1, letterSpacing: -2, wordBreak: "keep-all" }}>
        지난 20년,<br />데이터로 조직을 읽다.
      </div>
      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginTop: 8, wordBreak: "keep-all" }}>
        인사 관리와 조직 운영, 리더십을 통해<br />
        경쟁력을 확보하고 가치를 확대할 수 있도록<br />
        프로젝트를 수행해 왔습니다.
      </div>
    </div>
  );
};

const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealFrame = BRAND_REVEAL_AT * fps;
  const reveal = spring({ frame: frame - revealFrame, fps, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  const scale = interpolate(reveal, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 36, color: "rgba(255,255,255,0.6)", letterSpacing: 4 }}>
        INSIGHT GROUP이 만든 HR AI
      </div>
      <div style={{ fontSize: 260, fontWeight: 800, color: BRAND.colors.paper, letterSpacing: -8, lineHeight: 1 }}>
        쉐막
      </div>
      <div style={{ width: 120, height: 4, background: BRAND.colors.accent, marginTop: 8 }} />
    </div>
  );
};

export const IGIntroScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/02-ig-intro.mp3">
      <SceneBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "90px 110px",
          display: "grid",
          gridTemplateColumns: "minmax(380px, 0.85fr) 1.3fr",
          gap: 90,
          alignItems: "center",
        }}
      >
        <TitleBlock />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            columnGap: 70,
            rowGap: 70,
          }}
        >
          {CARDS.map((c) => (
            <StatCard key={c.caption} {...c} />
          ))}
        </div>
      </div>
      <BrandReveal />
    </SceneFrame>
  );
};
