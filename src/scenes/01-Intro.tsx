import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { Barn } from "../components/Barn";
import { BRAND } from "../lib/brand";

// 01 Intro (31.74s) — 2026-04-21 최종
// 0~3s  Q1: "요즘 같은 때 우리 회사 보상 수준은 경쟁력 있나요?"
// 4~7s  Q2: "저 부서는 왜 매일 야근하나요?"
// 8~11s Q3: "다른 회사 알아보는 사람들이 많아 진다는데?"
// 12~14s "뭔가 열심히 조사하고 보고하고 계시죠?"
// 15~18s "그 조사 데이터가 답이 되고 있나요?"
// 19~22s "쉐막은 궁금증을 모니터링 하며 답을 제안합니다"
// 23~31s 외양간 브랜드 스토리 (소 잃고 외양간 고치지 말자 / 미리 예측하자)

// v10: Q3 너무 빠름 피드백(00:07) → Q3 등장 후 체류 길게 + survey 진입 더 늦춤
// 또한 narration text "많아 진다는데" → "많아진다는데" (TTS는 이미 녹음됨, 자막만 변경)
const Q_START = [0.3, 4.0, 7.5];   // Q3 6.7 → 7.5 (체류 길게)
const SURVEY_AT = 12.0;
const QUESTION_AT = 16.5;
const MONITOR_AT = 20.0;
const BARN_AT = 24.3;

const QUESTIONS = [
  "요즘 같은 때 우리 회사 보상 수준은 경쟁력 있나요?",
  "저 부서는 왜 매일 야근하나요? 무슨 문제가 있을까요?",
  "다른 회사 알아보는 사람들이 많아진다는데 왜 그렇죠?",  // v10: 띄어쓰기 수정
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

// v11: 모니터 피드백 3건 — ①모니터 같지 않음 ②줌아웃 뻑뻑 ③모니터링 나레이션 시점 동기화
// 개선: cubic ease-in-out / 베젤 두껍게 + 받침대(neck+base) / 줌 타이밍 "모니터링" 단어와 정렬
const MonitorPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = MONITOR_AT * fps;
  const end = BARN_AT * fps;
  const lf = frame - start;

  // 페이즈 fade — 부드러운 12 frame(0.4s)
  const fadeIn  = interpolate(lf,   [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [end - 12, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = fadeIn * fadeOut;

  // "모니터링" 나레이션 시점부터 줌아웃 (lf=2.0s 시작, 1.8s 진행)
  // cubic ease-in-out 로 뻑뻑함 제거
  const z = Math.max(0, Math.min(1, (lf - 2.0 * fps) / (1.8 * fps)));
  const zoomEase = z < 0.5 ? 4 * z * z * z : 1 - Math.pow(-2 * z + 2, 3) / 2;

  const scale = interpolate(zoomEase, [0, 1], [1.08, 0.62]);
  const monitorReveal = interpolate(zoomEase, [0.1, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity,
    }}>
      <div style={{ position: "relative", transform: `scale(${scale})`, transformOrigin: "center" }}>
        {/* 모니터 본체 (베젤) — 상/좌/우 24px, 하단 44px 로 모니터 특징 강조 */}
        <div style={{
          position: "relative",
          padding: `${monitorReveal * 24}px ${monitorReveal * 26}px ${monitorReveal * 44}px`,
          borderRadius: `${monitorReveal * 18}px`,
          background: `rgba(28, 32, 40, ${monitorReveal})`,
          boxShadow: monitorReveal > 0.3
            ? `0 ${monitorReveal * 45}px ${monitorReveal * 90}px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.06)`
            : "none",
          border: `${monitorReveal * 2}px solid rgba(10, 12, 16, ${monitorReveal})`,
        }}>
          {/* 스크린 — 풀화면 → 모니터 내부로 */}
          <div style={{
            background: BRAND.colors.light.bg,
            padding: "64px 88px",
            borderRadius: `${monitorReveal * 6}px`,
            textAlign: "center",
            minWidth: 1120,
            position: "relative",
          }}>
            <div style={{ fontSize: 60, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1, marginBottom: 28 }}>
              <span style={{ color: BRAND.colors.primary }}>쉐막</span>은 이런 궁금증을
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: BRAND.colors.light.text }}>
              <span style={{ color: BRAND.colors.accentWarm }}>늘 모니터링</span>하며 답을 제안합니다.
            </div>
          </div>
          {/* 전원 LED (오른쪽 하단 베젤에) */}
          <div style={{
            position: "absolute",
            right: `${monitorReveal * 36}px`, bottom: `${monitorReveal * 14}px`,
            width: 6, height: 6, borderRadius: 3,
            background: BRAND.colors.primary,
            opacity: monitorReveal,
            boxShadow: `0 0 ${monitorReveal * 8}px ${BRAND.colors.primary}`,
          }}/>
          {/* 브랜드 로고 자리 (하단 베젤 중앙) */}
          <div style={{
            position: "absolute",
            left: "50%", bottom: `${monitorReveal * 14}px`,
            transform: "translateX(-50%)",
            fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2,
            opacity: monitorReveal,
          }}>SHEMAK</div>
        </div>
        {/* 받침대: neck(기둥) + base(받침) */}
        <div style={{
          position: "absolute", left: "50%", top: "100%",
          transform: `translateX(-50%) translateY(${interpolate(monitorReveal, [0, 1], [-24, 0])}px)`,
          opacity: monitorReveal,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          {/* neck (사다리꼴) */}
          <div style={{
            width: 90, height: 44,
            background: "linear-gradient(180deg, #2A3040, #1A1D26)",
            clipPath: "polygon(30% 0, 70% 0, 85% 100%, 15% 100%)",
          }}/>
          {/* base (넓고 얇은 받침) */}
          <div style={{
            width: 280, height: 16,
            background: "linear-gradient(180deg, #2A3040, #15171D)",
            borderRadius: "4px 4px 2px 2px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}/>
        </div>
      </div>
    </div>
  );
};

// 외양간 브랜드 스토리 — 울타리 탁탁 + strike 애니메이션
const BarnStoryPhase: React.FC = () => {
  const { frame, fps } = useTiming();
  const start = BARN_AT * fps;
  const reveal = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 110 } });
  const lf = frame - start;
  const fadeOut = interpolate(frame, [31.5 * fps, 31.74 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fadeOut;

  // 외양간 소개 텍스트
  const intro = spring({ frame: lf, fps, config: { damping: 18, stiffness: 130 } });
  // 울타리 막대 6개 — 0.3초 간격 순차 드롭
  const plankDelays = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8];
  // Strike 라인 — "소 잃고 외양간 고치지 말고" (left→right draw)
  const strikeStart = lf - 3.5 * fps;
  const strikeProgress = interpolate(strikeStart, [0, 1.2 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 미리 예측 강조
  const predictStart = lf - 5.5 * fps;
  const predict = spring({ frame: predictStart, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24, opacity, padding: "0 140px", textAlign: "center",
    }}>
      {/* 외양간 — v11-final: 심플 울타리 6막대 순차 드롭 + 🐂 (갈색 황소) */}
      <div style={{ opacity: interpolate(lf, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Barn
          width={520}
          startAt={BARN_AT + 0.3}
          cowAt={2.2}
          plankDelays={[0.3, 0.55, 0.8, 1.05, 1.3, 1.55]}
          showRoof={true}
        />
      </div>
      {/* 메인 텍스트 */}
      <div style={{
        fontSize: 52, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1,
        opacity: intro, marginTop: 12,
      }}>
        <span style={{ color: BRAND.colors.accentWarm }}>쉐막</span>은 "<span style={{ color: BRAND.colors.primary }}>외양간</span>"이라는 뜻
      </div>
      {/* "소 잃고 외양간 고치지 말고" — left→right strike 애니메이션 */}
      <div style={{
        position: "relative", display: "inline-block",
        opacity: interpolate(lf, [3 * fps, 3.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontSize: 28, color: BRAND.colors.light.textSubtle, fontWeight: 500,
        }}>
          소 잃고 외양간 고치지 말고
        </div>
        {/* 애니메이션 strike line — left→right 그려짐 */}
        <div style={{
          position: "absolute", left: 0, top: "50%", height: 3, background: "#DC2626",
          width: `${strikeProgress * 100}%`,
          boxShadow: "0 0 4px rgba(220,38,38,0.4)",
        }}/>
      </div>
      {/* 미리 예측 (강조) */}
      <div style={{
        fontSize: 44, fontWeight: 800, color: BRAND.colors.primary, letterSpacing: -0.5,
        opacity: predict, transform: `scale(${interpolate(predict, [0, 1], [0.85, 1])})`,
      }}>
        <span style={{ color: BRAND.colors.accentWarm }}>미리 예측</span>하자
      </div>
    </div>
  );
};
