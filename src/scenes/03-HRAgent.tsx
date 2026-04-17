import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { MouseCursor } from "../components/MouseCursor";
import { Spotlight } from "../components/Spotlight";
import { BRAND } from "../lib/brand";

// 03 HR Agent (55s) — 사용자 v4 피드백:
//   00:47에 인건비 시뮬레이션이 안 보임 → EXEC_1 (조직현황) 제거, 14s부터 바로 인건비 시뮬레이션
//
//   EXECUTIVE  13.5~24.5s #2 인건비 시뮬레이션  hr-agent 13s  (+마우스+스포트라이트)
//   HR_HEAD_1  24.5~36.8s #3 몰입유형 설명     ilji 3s
//   HR_HEAD_2  36.8~47.5s #4 AI 최적 인상률    ilji 13s
//   TEAM_LEAD  48~55s     #5 팀 현황 1on1     hr-agent 29s

const PHASES = {
  OPENER:     { start: 0.5,  end: 13.5 },
  EXECUTIVE:  { start: 13.5, end: 24.5, video: "videos/hr-agent-demo.webm", videoStartFrom: 390 }, // 13s 인건비 시뮬레이션
  HR_HEAD_1:  { start: 24.5, end: 36.8, video: "videos/ilji-demo.webm",     videoStartFrom: 90  }, // 3s 몰입유형
  HR_HEAD_2:  { start: 36.8, end: 47.5, video: "videos/ilji-demo.webm",     videoStartFrom: 390 }, // 13s AI 최적 인상률
  TEAM_LEAD:  { start: 47.5, end: 55.0, video: "videos/hr-agent-demo.webm", videoStartFrom: 870 }, // 29s 팀 현황 1on1
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

// 마우스 효과: 보수적 → 균형(클릭) → 적극 (EXECUTIVE 안)
// 영상 좌표 (1920×1080 정규화) — 인건비 시뮬레이션 카드 위치
const MOUSE_EXEC = [
  { t: 17.5, x: 0.18, y: 0.30 },           // 보수적 운영
  { t: 18.5, x: 0.50, y: 0.30, click: true }, // 균형 성장 (클릭)
  { t: 19.5, x: 0.82, y: 0.30 },           // 적극 투자
];

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/03-hr-agent.mp3" background={BRAND.colors.dark.bg}>
      <OpenerPhase />
      <ExecutivePhase />
      <HRHead1Phase />
      <HRHead2Phase />
      <TeamLeadPhase />
      {/* 마우스 움직임 (17.5~19.5s) — 보수적/균형/적극 카드 위 */}
      <MouseCursor waypoints={MOUSE_EXEC} showFrom={17.2} showTo={19.8} />
      {/* AI 분석 코멘트 스포트라이트 (20~24s) — 인건비 시뮬레이션 화면 하단 */}
      <Spotlight x={0.10} y={0.68} width={0.80} height={0.18} from={20.0} to={23.8} />
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

const ExecutivePhase: React.FC = () => <VideoPhase phase={PHASES.EXECUTIVE} />;
const HRHead1Phase: React.FC   = () => <VideoPhase phase={PHASES.HR_HEAD_1} />;
const HRHead2Phase: React.FC   = () => <VideoPhase phase={PHASES.HR_HEAD_2} />;
const TeamLeadPhase: React.FC  = () => <VideoPhase phase={PHASES.TEAM_LEAD} />;
