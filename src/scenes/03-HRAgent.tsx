import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { MouseCursor } from "../components/MouseCursor";
import { Spotlight } from "../components/Spotlight";
import { BRAND } from "../lib/brand";

// 03 HR Agent (55s) — 풀스크린 대시보드 영상 + 핵심 자막 + 마우스/스포트라이트 효과
// 사용자 피드백 매핑:
//   EXECUTIVE: hr-agent-demo 7초부터 (사용자 지정)
//   HR_HEAD:   ilji-demo 0초부터 (몰입유형 → AI 전략 → SIM)
//   TEAM_LEAD: hr-agent-demo 23초부터 (사용자 지정 23~28초)

const PHASES = {
  OPENER:    { start: 0.5,  end: 13.5 },
  EXECUTIVE: { start: 13.5, end: 24.5, video: "videos/hr-agent-demo.webm", videoStartFrom: 210 }, // 7s
  HR_HEAD:   { start: 24.5, end: 47.5, video: "videos/ilji-demo.webm",     videoStartFrom: 0   },
  TEAM_LEAD: { start: 47.5, end: 55.0, video: "videos/hr-agent-demo.webm", videoStartFrom: 690 }, // 23s
};

// 자막은 핵심 키워드만 (사용자 피드백: "모든 글씨 쓸 필요 없음")
const CUES: Cue[] = [
  { start: 14.0, end: 19.5, text: "인건비 시나리오 설계" },
  { start: 19.8, end: 24.0, text: "보수적 · 균형 · 적극 — AI가 즉시 비교" },
  { start: 24.9, end: 29.0, text: "기본급 인상률 최적 배분" },
  { start: 29.3, end: 34.0, text: "몰입 유형 · 평가 · 스킬 · 시장 임금" },
  { start: 34.5, end: 39.0, text: "AI가 자동 크롤링 · 종합 판단" },
  { start: 39.5, end: 47.0, text: "안정 · 균형 · 성과 집중 — 개인별 시뮬레이션" },
  { start: 48.2, end: 53.9, text: "팀 현황 · 1:1 면담 · KPI 실시간 관리" },
];

// 마우스 효과 (사용자 피드백 #2): 보수적/균형/적극으로 이동, 균형 클릭
// 영상 좌표 (1920×1080 기준 정규화) — 13s 시점 인건비 시뮬레이션 카드 위치
const MOUSE_EXEC = [
  { t: 17.0, x: 0.20, y: 0.30 },          // 보수적 운영
  { t: 18.0, x: 0.50, y: 0.30, click: true }, // 균형 성장 (클릭)
  { t: 19.0, x: 0.80, y: 0.30 },          // 적극 투자
];

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/03-hr-agent.mp3" background={BRAND.colors.dark.bg}>
      <OpenerPhase />
      <ExecutivePhase />
      <HRHeadPhase />
      <TeamLeadPhase />
      {/* 사용자 피드백 #2: 마우스 움직임 (17~19s) */}
      <MouseCursor waypoints={MOUSE_EXEC} showFrom={16.8} showTo={19.5} />
      {/* 사용자 피드백 #3: AI 분석 코멘트 스포트라이트 (20~24s) */}
      <Spotlight x={0.10} y={0.62} width={0.80} height={0.18} from={20.0} to={23.8} />
      <Subtitle cues={CUES} fontSize={34} bottom={70} />
    </SceneFrame>
  );
};

const useTiming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

// 피드백: phase 전환 시 화면 겹침 → fade transition 짧게 (6 frame = 0.2s)
const usePhase = (phase: { start: number; end: number }) => {
  const { frame, fps } = useTiming();
  const start = phase.start * fps;
  const end = phase.end * fps;
  const inP = interpolate(frame, [start, start + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 6, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * outP, frame, fps, start, end };
};

// P1: Opener (영상 없음, 풀스크린 카드)
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
  // 시각 키워드 3개 차례 등장 (붕 뜨는 시간 시각화)
  const KEYWORDS = [
    { label: "판단",   delay: 3.5 },
    { label: "추론",   delay: 5.0 },
    { label: "해결",   delay: 6.5 },
  ];

  return (
    <AbsoluteFill style={{
      opacity,
      padding: "0 120px",
      // 피드백: 헤더+키워드+카드를 화면 중앙에 묶어서 배치
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

      {/* 시각 키워드: AI가 스스로 판단·추론·해결 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 36 }}>
        {KEYWORDS.map((k, i) => {
          const r = spring({ frame: lf - k.delay * fps, fps, config: { damping: 18, stiffness: 130 } });
          // 카드들 등장(8.2s)할 때 키워드는 fade out
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

// 영상 phase 공통
const VideoPhase: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const { opacity } = usePhase(phase);
  return (
    <AbsoluteFill style={{ opacity }}>
      <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
    </AbsoluteFill>
  );
};

const ExecutivePhase: React.FC = () => <VideoPhase phase={PHASES.EXECUTIVE} />;
const HRHeadPhase: React.FC   = () => <VideoPhase phase={PHASES.HR_HEAD} />;
const TeamLeadPhase: React.FC = () => <VideoPhase phase={PHASES.TEAM_LEAD} />;
