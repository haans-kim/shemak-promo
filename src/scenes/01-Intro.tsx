import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 피드백 반영 (Q1 = C):
// CEO 3질문 → "매년 서베이 하시지만 실효성 있나요?" 연결 → 2주→2시간 임팩트

// 음성 분석 기반 타이밍 (2026-04-16)
// Q1 "우리 직원들~" 실제 1.37s / Q2 "우리 회사 페이~" 4.34s / Q3 "이번 분기~" 6.80s
// "매년 서베이" 9.66s / "그런데 답이 되고 있나요?" 11.68s / "임원 회의 자료~" 16.63s
const Q_START = [0.5, 4.0, 6.5];
const SURVEY_AT = 9.3;
const QUESTION_AT = 11.3;
const IMPACT_AT = 15.7; // 음성 16.63s보다 약간 앞당김 — 화면이 음성보다 먼저 떠야 자연스러움 (피드백 #1)

const QUESTIONS = [
  "우리 직원들, 요즘 열심히 일하고 있나요?",
  "우리 회사 페이, 경쟁력 있나요?",
  "이번 분기, 누가 떠날 위험이 있죠?",
];

export const IntroScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/01-intro.mp3" background={BRAND.colors.dark.bg}>
      <QuestionPhase />
      <SurveyPhase />
      <QuestionConnector />
      <ImpactPhase />
    </SceneFrame>
  );
};

const useTiming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

const QuestionPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const fadeFrame = SURVEY_AT * fps;
  // 피드백: 화면 전환 빠르게 (cross-fade 길어 겹침 느낌) — 20→6 frames
  const fadeOut = interpolate(frame, [fadeFrame - 6, fadeFrame + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 24,
      padding: "0 140px",
      opacity: fadeOut,
    }}>
      <div style={{
        fontSize: 18,
        color: BRAND.colors.accent,
        letterSpacing: 4,
        marginBottom: 20,
        fontWeight: 600,
      }}>
        — 경영진 회의 —
      </div>
      {QUESTIONS.map((q, i) => (
        <Question key={i} text={q} startAt={Q_START[i]} />
      ))}
    </div>
  );
};

interface QProps { text: string; startAt: number; }

const Question: React.FC<QProps> = ({ text, startAt }) => {
  const { frame, fps } = useTiming();
  const startFrame = startAt * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 140 } });
  const translateY = interpolate(reveal, [0, 1], [15, 0]);
  return (
    <div style={{
      fontSize: 44,
      color: BRAND.colors.dark.text,
      fontWeight: 500,
      opacity: reveal,
      transform: `translateY(${translateY}px)`,
      lineHeight: 1.4,
      textAlign: "center",
    }}>
      <span style={{ color: BRAND.colors.accent, marginRight: 12 }}>"</span>
      {text}
      <span style={{ color: BRAND.colors.accent, marginLeft: 12 }}>"</span>
    </div>
  );
};

const SurveyPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = SURVEY_AT * fps;
  const end = QUESTION_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 160 } }); // 더 빠른 등장
  const fadeOut = interpolate(frame, [end - 6, end + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
    }}>
      <div style={{ fontSize: 56, fontWeight: 700, color: BRAND.colors.dark.text, textAlign: "center", lineHeight: 1.3 }}>
        매년 <span style={{ color: BRAND.colors.accent }}>서베이</span>, 하고 계시죠?
      </div>
    </div>
  );
};

const QuestionConnector: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = QUESTION_AT * fps;
  const end = IMPACT_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 160 } });
  const fadeOut = interpolate(frame, [end - 6, end + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 24,
      opacity,
      padding: "0 160px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 28, color: BRAND.colors.dark.textMuted }}>
        그런데,
      </div>
      <div style={{ fontSize: 46, fontWeight: 700, color: BRAND.colors.dark.text, lineHeight: 1.4 }}>
        그 데이터가 <br />
        <span style={{ color: BRAND.colors.accentWarm }}>이런 질문에 답이 되고 있나요?</span>
      </div>
    </div>
  );
};

const ImpactPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = IMPACT_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 160 } });
  const translateY = interpolate(reveal, [0, 1], [40, 0]);
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 40,
      opacity: reveal,
      transform: `translateY(${translateY}px)`,
    }}>
      <div style={{ fontSize: 32, color: BRAND.colors.dark.textMuted }}>
        임원 회의 자료 만드는 데,
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <TimeBlock label="지금" time="2주" color={BRAND.colors.dark.textMuted} strike />
        <div style={{ fontSize: 64, color: BRAND.colors.accent, fontWeight: 300 }}>→</div>
        <TimeBlock label="쉐막이라면" time="2시간" color={BRAND.colors.accentWarm} />
      </div>
    </div>
  );
};

const TimeBlock: React.FC<{ label: string; time: string; color: string; strike?: boolean; }> = ({ label, time, color, strike }) => (
  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ fontSize: 20, color: BRAND.colors.dark.textSubtle, letterSpacing: 2 }}>{label}</div>
    <div style={{
      fontSize: 140,
      fontWeight: 800,
      color,
      letterSpacing: -4,
      textDecoration: strike ? "line-through" : "none",
      textDecorationThickness: 6,
      lineHeight: 1,
    }}>
      {time}
    </div>
  </div>
);
