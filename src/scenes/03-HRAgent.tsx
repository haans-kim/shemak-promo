import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 03 HR Agent (47.05s) — 2026-04-21 최종본
// 0~6.5s   OPENER (판단·추론·해결 + 3 에이전트 카드)
// 6.5~18s  CEO 경영진 — phase13_ceo_overview (전사 목표 KPI)
// 18~35s   HR 임원 — phase16_ilji_simulation (최적 인상률 → Simulation)
// 35~47s   팀장 — phase17_team_skill

// v9.1 실제 TTS silence 기반 sync
// silences: @13.53 (오프너 종료) / @24.46 (CEO 종료) / @33.62/35.77 (HR 임원 종료) / @46.79 (팀장 종료)
const PHASES = {
  OPENER:    { start: 0.2,  end: 13.5 },                                   // 8.5 → 13.5 (오프너 narration 풀 커버)
  CEO_VIEW:  { start: 13.5, end: 24.5, video: "videos/phase13_ceo_overview.webm", videoStartFrom: 0 },
  HR_HEAD:   { start: 24.5, end: 36.0, video: "videos/phase16_ilji_simulation.webm", videoStartFrom: 0 },
  TEAM_LEAD: { start: 36.0, end: 47.05, video: "videos/phase17_team_skill.webm", videoStartFrom: 0 },
};

// v9.1: cue 타이밍도 실제 narration에 맞춰 재조정
const CUES: Cue[] = [
  { start: 14.0, end: 19.0, text: "경영진 AI — 전사 목표·KPI 모니터링" },
  { start: 19.3, end: 24.0, text: "연말 실적 추정 → 수정해야 할 과제 제시" },
  { start: 25.0, end: 29.5, text: "HR 임원 AI — 보상 인상률 최적 배분" },
  { start: 30.0, end: 35.5, text: "몰입·스킬·평가·번아웃·시장임금 자동 크롤링·종합판단" },
  { start: 36.5, end: 46.0, text: "팀장 에이전트 — 1:1 면담·팀원 특성·업무 현황 정리·보고" },
];

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/03-hr-agent.mp3" background={BRAND.colors.light.bg}>
      <OpenerPhase />
      <CEOPhase />
      <HRHeadPhase />
      <TeamLeadPhase />
      <Subtitle cues={CUES} fontSize={32} bottom={70} />
    </SceneFrame>
  );
};

const usePhase = (phase: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = phase.start * fps;
  const end = phase.end * fps;
  const inP = interpolate(frame, [start, start + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 6, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * outP, frame, fps, start, end };
};

// ─── P1 OPENER: 키워드 + 3 에이전트 카드 ───
const OpenerPhase: React.FC = () => {
  const { opacity, frame, fps, start } = usePhase(PHASES.OPENER);
  const lf = frame - start;
  const title = spring({ frame: lf, fps, config: { damping: 20, stiffness: 110 } });
  const KEYWORDS = [
    { label: "판단", delay: 0.5 },
    { label: "추론", delay: 2.0 },
    { label: "해결", delay: 4.0 },
  ];
  // v9.1 실제 TTS sync: "경영진, HR 임원, 모든 팀장" narration ~6~9s 사이 → 카드도 그 시점
  const AGENTS = [
    { role: "경영진",   focus: "전사 목표·KPI",     color: BRAND.colors.primary,    delay: 7.0 },
    { role: "HR 임원",  focus: "보상 인상률 배분",  color: BRAND.colors.accent,     delay: 7.7 },
    { role: "팀장",     focus: "1:1 면담 · KPI",    color: BRAND.colors.accentWarm, delay: 8.4 },
  ];
  // 매듭 풀림 애니메이션 — "감으로만 풀기 어려운 복잡한 문제를 해결합니다" narration 구간(5~6s)
  const knotProgress = interpolate(lf, [5 * fps, 7 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{
      opacity, padding: "80px 120px",
      display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "stretch", gap: 50,
    }}>
      <div style={{ textAlign: "center", opacity: title, transform: `translateY(${interpolate(title, [0, 1], [18, 0])}px)` }}>
        <div style={{ fontSize: 22, color: BRAND.colors.primary, letterSpacing: 4, fontWeight: 600, marginBottom: 12 }}>
          HR AGENT
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1, lineHeight: 1.25 }}>
          복잡한 인사 문제를 <span style={{ color: BRAND.colors.accentWarm }}>AI 에이전트</span>가 풀어냅니다
        </div>
      </div>
      {/* 매듭 풀림 애니메이션 — 3가닥 SVG path (5~7s) */}
      <div style={{ position: "relative", height: 120, display: "flex", justifyContent: "center" }}>
        <svg width="600" height="120" viewBox="0 0 600 120" style={{ opacity: interpolate(lf, [4.5 * fps, 5 * fps, 7.2 * fps], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {/* 3가닥의 path가 knotProgress에 따라 꼬임→풀림 */}
          {[BRAND.colors.primary, BRAND.colors.accent, BRAND.colors.accentWarm].map((color, i) => {
            const targetX = 150 + i * 150;
            // knotProgress 0: 모든 선이 중앙에서 꼬임, 1: 각 카드 위치로 직선화
            const startX = 300 + (i - 1) * 20 * Math.sin(knotProgress * Math.PI * 2 + i);
            const d = knotProgress < 0.5
              ? `M ${startX} 10 Q ${300 + Math.sin(i + knotProgress * 10) * 40} 60, ${300 - Math.sin(i * 2) * 30 * (1 - knotProgress)} 110`
              : `M ${300 + (targetX - 300) * (knotProgress - 0.3) / 0.7} 10 L ${targetX} 110`;
            return (
              <path key={i} d={d} stroke={color} strokeWidth={4} fill="none"
                    strokeLinecap="round" opacity={0.85}/>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 36 }}>
        {KEYWORDS.map((k, i) => {
          const r = spring({ frame: lf - k.delay * fps, fps, config: { damping: 18, stiffness: 130 } });
          const colors = [BRAND.colors.primary, BRAND.colors.accent, BRAND.colors.accentWarm];
          return (
            <div key={k.label} style={{
              padding: "16px 40px",
              background: `${colors[i]}18`,
              border: `2px solid ${colors[i]}`,
              borderRadius: 14,
              fontSize: 32, fontWeight: 800, color: colors[i], letterSpacing: 1,
              opacity: r,
              transform: `translateY(${interpolate(r, [0, 1], [20, 0])}px) scale(${interpolate(r, [0, 1], [0.85, 1])})`,
            }}>{k.label}</div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {AGENTS.map((a) => {
          const r = spring({ frame: lf - a.delay * fps, fps, config: { damping: 20, stiffness: 100 } });
          return (
            <div key={a.role} style={{
              padding: "30px 24px",
              background: BRAND.colors.light.bgSoft,
              border: `2px solid ${a.color}`,
              borderRadius: 16, textAlign: "center",
              opacity: r,
              transform: `translateY(${interpolate(r, [0, 1], [30, 0])}px)`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: a.color, marginBottom: 10 }}>{a.role}</div>
              <div style={{ fontSize: 16, color: BRAND.colors.light.textMuted, lineHeight: 1.5 }}>{a.focus}</div>
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

const CEOPhase: React.FC     = () => <VideoPhase phase={PHASES.CEO_VIEW} />;
const HRHeadPhase: React.FC  = () => <VideoPhase phase={PHASES.HR_HEAD} />;
const TeamLeadPhase: React.FC = () => <VideoPhase phase={PHASES.TEAM_LEAD} />;
