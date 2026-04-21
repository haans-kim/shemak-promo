import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 01 Intro (31.74s) — 2026-04-21 최종
// 0~3s  Q1: "요즘 같은 때 우리 회사 보상 수준은 경쟁력 있나요?"
// 4~7s  Q2: "저 부서는 왜 매일 야근하나요?"
// 8~11s Q3: "다른 회사 알아보는 사람들이 많아 진다는데?"
// 12~14s "뭔가 열심히 조사하고 보고하고 계시죠?"
// 15~18s "그 조사 데이터가 답이 되고 있나요?"
// 19~22s "쉐막은 궁금증을 모니터링 하며 답을 제안합니다"
// 23~31s 외양간 브랜드 스토리 (소 잃고 외양간 고치지 말자 / 미리 예측하자)

const Q_START = [0.5, 4.5, 8.5];
const SURVEY_AT = 12.5;
const QUESTION_AT = 15.5;
const MONITOR_AT = 19.0;
const BARN_AT = 22.5;

const QUESTIONS = [
  "요즘 같은 때 우리 회사 보상 수준은 경쟁력 있나요?",
  "저 부서는 왜 매일 야근하나요? 무슨 문제가 있을까요?",
  "다른 회사 알아보는 사람들이 많아 진다는데 왜 그렇죠?",
];

export const IntroScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/01-intro.mp3" background={BRAND.colors.light.bg}>
      <QuestionPhase />
      <SurveyPhase />
      <QuestionConnector />
      <MonitorPhase />
      <BarnStoryPhase />
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
  const fadeOut = interpolate(frame, [fadeFrame - 6, fadeFrame + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      gap: 24, padding: "0 140px", opacity: fadeOut,
    }}>
      <div style={{
        fontSize: 18, color: BRAND.colors.primary, letterSpacing: 4, marginBottom: 20, fontWeight: 600,
      }}>— 경영진 회의 —</div>
      {QUESTIONS.map((q, i) => (
        <Question key={i} text={q} startAt={Q_START[i]} />
      ))}
    </div>
  );
};

const Question: React.FC<{ text: string; startAt: number }> = ({ text, startAt }) => {
  const { frame, fps } = useTiming();
  const startFrame = startAt * fps;
  const reveal = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 140 } });
  const translateY = interpolate(reveal, [0, 1], [15, 0]);
  return (
    <div style={{
      fontSize: 40, color: BRAND.colors.light.text, fontWeight: 500,
      opacity: reveal, transform: `translateY(${translateY}px)`,
      lineHeight: 1.4, textAlign: "center",
    }}>
      <span style={{ color: BRAND.colors.primary, marginRight: 12 }}>"</span>
      {text}
      <span style={{ color: BRAND.colors.primary, marginLeft: 12 }}>"</span>
    </div>
  );
};

const SurveyPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = SURVEY_AT * fps;
  const end = QUESTION_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 160 } });
  const fadeOut = interpolate(frame, [end - 6, end + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center", opacity,
    }}>
      <div style={{ fontSize: 52, fontWeight: 700, color: BRAND.colors.light.text, textAlign: "center", lineHeight: 1.3 }}>
        뭔가 열심히 <span style={{ color: BRAND.colors.primary }}>조사</span>하고 <span style={{ color: BRAND.colors.primary }}>보고</span>하고 계시죠?
      </div>
    </div>
  );
};

const QuestionConnector: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = QUESTION_AT * fps;
  const end = MONITOR_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 160 } });
  const fadeOut = interpolate(frame, [end - 6, end + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24, opacity, padding: "0 160px", textAlign: "center",
    }}>
      <div style={{ fontSize: 28, color: BRAND.colors.light.textMuted }}>그런데,</div>
      <div style={{ fontSize: 44, fontWeight: 700, color: BRAND.colors.light.text, lineHeight: 1.4 }}>
        그 조사 데이터가 <br />
        <span style={{ color: BRAND.colors.accentWarm }}>앞 질문들에 답이 되고 있나요?</span>
      </div>
    </div>
  );
};

const MonitorPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = MONITOR_AT * fps;
  const end = BARN_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 110 } });
  const fadeOut = interpolate(frame, [end - 6, end + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 28, opacity, padding: "0 140px", textAlign: "center",
    }}>
      <div style={{ fontSize: 60, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1 }}>
        <span style={{ color: BRAND.colors.primary }}>쉐막</span>은 이런 궁금증을
      </div>
      <div style={{ fontSize: 56, fontWeight: 700, color: BRAND.colors.light.text }}>
        <span style={{ color: BRAND.colors.accentWarm }}>늘 모니터링</span>하며 답을 제안합니다.
      </div>
    </div>
  );
};

// 외양간 브랜드 스토리 (소·외양간 아이콘 + 텍스트)
const BarnStoryPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = BARN_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 110 } });
  const lf = frame - start;
  const fadeOut = interpolate(frame, [31.5 * fps, 31.74 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  // 순차 등장
  const barn = spring({ frame: lf, fps, config: { damping: 18, stiffness: 130 } });
  const sub1 = spring({ frame: lf - 1.5 * fps, fps, config: { damping: 18, stiffness: 120 } });
  const sub2 = spring({ frame: lf - 4.5 * fps, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24, opacity, padding: "0 140px", textAlign: "center",
    }}>
      {/* 소·외양간 이모지 아이콘 */}
      <div style={{
        fontSize: 140, lineHeight: 1,
        opacity: barn,
        transform: `scale(${interpolate(barn, [0, 1], [0.7, 1])})`,
      }}>
        🐄 🏠
      </div>
      {/* 메인 텍스트 "쉐막 = 외양간" */}
      <div style={{
        fontSize: 54, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1,
        opacity: barn,
      }}>
        <span style={{ color: BRAND.colors.accentWarm }}>쉐막</span>은 "<span style={{ color: BRAND.colors.primary }}>외양간</span>"이라는 뜻
      </div>
      {/* 서브 텍스트 1 */}
      <div style={{
        fontSize: 30, color: BRAND.colors.light.textMuted, fontWeight: 500,
        opacity: sub1, transform: `translateY(${interpolate(sub1, [0, 1], [12, 0])}px)`,
      }}>
        <span style={{ textDecoration: "line-through", textDecorationThickness: 2, color: BRAND.colors.light.textSubtle }}>
          소 잃고 외양간 고치지 말고
        </span>
      </div>
      {/* 서브 텍스트 2 (강조) */}
      <div style={{
        fontSize: 40, fontWeight: 800, color: BRAND.colors.primary, letterSpacing: -0.5,
        opacity: sub2, transform: `scale(${interpolate(sub2, [0, 1], [0.9, 1])})`,
      }}>
        ✨ <span style={{ color: BRAND.colors.accentWarm }}>미리 예측</span>하자
      </div>
    </div>
  );
};
