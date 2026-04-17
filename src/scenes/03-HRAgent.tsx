import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { MouseCursor } from "../components/MouseCursor";
import { BRAND } from "../lib/brand";

// 03 HR Agent (55s) — 사용자 v5 피드백:
//   EXECUTIVE: 영상 13s 한 프레임을 정적 이미지로 사용 (영상은 18초 이후 다른 화면으로 전환되어 잘못 보임)
//   → exec-cost-sim.jpg 정지 + 마우스 효과
//
//   EXECUTIVE  13.5~24.5s #2 인건비 시뮬레이션 (정적 이미지 + 마우스)
//   HR_HEAD_1  24.5~36.8s #3 몰입유형 설명     ilji 3s
//   HR_HEAD_2  36.8~47.5s #4 AI 최적 인상률    ilji 13s
//   TEAM_LEAD  48~55s     #5 팀 현황 1on1     hr-agent 29s

const PHASES = {
  OPENER:     { start: 0.5,  end: 13.5 },
  EXECUTIVE:  { start: 13.5, end: 24.5 }, // 정적 이미지
  HR_HEAD_1:  { start: 24.5, end: 36.8, video: "videos/ilji-demo.webm",     videoStartFrom: 90  },
  HR_HEAD_2:  { start: 36.8, end: 47.5, video: "videos/ilji-demo.webm",     videoStartFrom: 390 },
  TEAM_LEAD:  { start: 47.5, end: 55.0, video: "videos/hr-agent-demo.webm", videoStartFrom: 1080 }, // 36s — 사이트 자동슬라이드(HR TF 대체...) 피하기
};

const CUES: Cue[] = [
  { start: 14.0, end: 17.0, text: "인건비 시나리오 설계" },
  { start: 17.5, end: 19.5, text: "보수적 · 균형 · 적극 — AI가 즉시 비교" },
  { start: 19.8, end: 24.0, text: "3년 추이 + AI 분석 코멘트" },
  { start: 24.9, end: 28.7, text: "기본급 인상률 최적 배분" },
  { start: 29.3, end: 32.6, text: "몰입 유형 · 평가 · 스킬 · 시장 임금" },
  { start: 33.0, end: 36.5, text: "AI가 자동 크롤링 · 종합 판단" },
  { start: 37.4, end: 40.0, text: "안정 · 균형 · 성과 집중" },
  { start: 40.4, end: 47.0, text: "조직 보상전략 · 개인별 시뮬레이션" },
  { start: 48.2, end: 53.9, text: "팀 현황 · 1:1 면담 · KPI 실시간 관리" },
];


// EXECUTIVE 마우스 시간을 길게 — 보수→균형→적극 모두 훑어줌 (15~19s)
const MOUSE_EXEC_FULL = [
  { t: 15.0, x: 0.18, y: 0.30 },           // 보수적 운영 호버
  { t: 16.5, x: 0.50, y: 0.30, click: true }, // 균형 성장 (클릭)
  { t: 18.0, x: 0.82, y: 0.30 },           // 적극 투자 호버
  { t: 19.5, x: 0.50, y: 0.30 },           // 균형 다시
];

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/03-hr-agent.mp3" background={BRAND.colors.dark.bg}>
      <OpenerPhase />
      <ExecutiveStaticPhase />
      <HRHead1Phase />
      <HRHead2Phase />
      <TeamLeadPhase />
      {/* 마우스 움직임 (15~19.5s) — 보수적·균형·적극 모두 훑어줌 */}
      <MouseCursor waypoints={MOUSE_EXEC_FULL} showFrom={14.8} showTo={20.0} />
      <Subtitle cues={CUES} fontSize={34} bottom={70} />
    </SceneFrame>
  );
};

const useTiming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

// phase 전환 빠르게 (cross-fade 0.2s)
const usePhase = (phase: { start: number; end: number }) => {
  const { frame, fps } = useTiming();
  const start = phase.start * fps;
  const end = phase.end * fps;
  const inP = interpolate(frame, [start, start + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 6, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * outP, frame, fps, start, end };
};

// P1: Opener — 헤더 + 키워드 + 3 Agent 카드 (영상 없음, 화면 중앙 정렬)
const OpenerPhase: React.FC = () => {
  const { opacity, frame, fps, start } = usePhase(PHASES.OPENER);
  const lf = frame - start;
  const title = spring({ frame: lf, fps, config: { damping: 20, stiffness: 110 } });
  const cardDelays = [8.2, 8.7, 9.2];

  const AGENTS = [
    { role: "경영진",   color: BRAND.colors.accent,     focus: "전사 인건비 시나리오" },
    { role: "HR 임원", color: BRAND.colors.accentWarm, focus: "기본급 최적 배분" },
    { role: "팀장",    color: "#A78BFA",                focus: "팀 현황 · 1:1 · KPI" },
  ];

  // narration 3.7~7.8s "AI가 스스로 판단하고, 추론하고, 복잡한 인사 문제를 풀어냅니다"
  const KEYWORDS = [
    { label: "판단",   delay: 3.5 },
    { label: "추론",   delay: 5.0 },
    { label: "해결",   delay: 6.5 },
  ];

  return (
    <AbsoluteFill style={{
      opacity,
      padding: "0 120px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "stretch",
      gap: 40,
    }}>
      <div style={{ textAlign: "center", opacity: title, transform: `translateY(${interpolate(title, [0, 1], [18, 0])}px)` }}>
        <div style={{ fontSize: 22, color: BRAND.colors.accent, letterSpacing: 4, fontWeight: 600, marginBottom: 12 }}>
          HR AGENT
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: BRAND.colors.dark.text, letterSpacing: -1, lineHeight: 1.25 }}>
          쉐막의 중심, <span style={{ color: BRAND.colors.accentWarm }}>HR Agent</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 36 }}>
        {KEYWORDS.map((k, i) => {
          const r = spring({ frame: lf - k.delay * fps, fps, config: { damping: 18, stiffness: 130 } });
          const fadeOut = interpolate(lf, [7.8 * fps, 8.2 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const colors = [BRAND.colors.accent, BRAND.colors.accentWarm, "#A78BFA"];
          return (
            <div key={k.label} style={{
              padding: "16px 36px",
              background: `${colors[i]}18`,
              border: `2px solid ${colors[i]}`,
              borderRadius: 12,
              fontSize: 30,
              fontWeight: 800,
              color: colors[i],
              letterSpacing: 1,
              opacity: r * fadeOut,
              transform: `translateY(${interpolate(r, [0, 1], [20, 0])}px) scale(${interpolate(r, [0, 1], [0.85, 1])})`,
            }}>
              {k.label}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {AGENTS.map((a, i) => {
          const reveal = spring({ frame: lf - cardDelays[i] * fps, fps, config: { damping: 20, stiffness: 100 } });
          return (
            <div key={a.role} style={{
              padding: "30px 24px",
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${a.color}`,
              borderRadius: 16,
              textAlign: "center",
              opacity: reveal,
              transform: `translateY(${interpolate(reveal, [0, 1], [30, 0])}px)`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: a.color, marginBottom: 14 }}>{a.role}</div>
              <div style={{ fontSize: 16, color: BRAND.colors.dark.textMuted, lineHeight: 1.5 }}>{a.focus}</div>
              <div style={{ fontSize: 11, color: a.color, marginTop: 16, letterSpacing: 3, fontWeight: 600 }}>AI AGENT</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const VideoPhase: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const { opacity } = usePhase(phase);
  return (
    <AbsoluteFill style={{ opacity }}>
      <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
    </AbsoluteFill>
  );
};

// EXECUTIVE — 정적 이미지 (영상 13s 한 프레임 — 인건비 시뮬레이션 화면 정지)
const ExecutiveStaticPhase: React.FC = () => {
  const { opacity } = usePhase(PHASES.EXECUTIVE);
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img src={staticFile("images/exec-cost-sim.jpg")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </AbsoluteFill>
  );
};

const HRHead1Phase: React.FC   = () => <VideoPhase phase={PHASES.HR_HEAD_1} />;
const HRHead2Phase: React.FC   = () => <VideoPhase phase={PHASES.HR_HEAD_2} />;
const TeamLeadPhase: React.FC  = () => <VideoPhase phase={PHASES.TEAM_LEAD} />;
