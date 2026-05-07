import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 03 HR Agent (52.18s) — v20 spliced audio + narration_final 통일 자막
// PHASES: line 그룹 단위
//   OPENER     0.00~14.00s (line 1~4: AI가 패턴 / 감으로만 / 경영진·HR 임원·모든 팀장 / 각 직책)
//   CEO_VIEW   15.00~26.56s (line 5~6: 경영진 AI 에이전트 / 모든 KPI)
//   HR_HEAD    27.44~44.50s (line 7~9: HR 임원 AI / 몰입 유형 / 그리고 시장 임금)
//   TEAM_LEAD  45.30~52.18s (line 10: 팀장 에이전트)
const PHASES = {
  OPENER:    { start: 0.0,   end: 14.00 },
  CEO_VIEW:  { start: 15.00, end: 26.56, video: "videos/phase13_ceo_overview.webm",    videoStartFrom: 0 },
  HR_HEAD:   { start: 27.44, end: 44.50, video: "videos/phase16_ilji_simulation.webm", videoStartFrom: 0 },
  TEAM_LEAD: { start: 45.30, end: 52.18, video: "videos/phase17_team_skill.webm",      videoStartFrom: 0 },
};

// v20: 자막 narration_final.txt 그대로 통일 (line 단위)
const CUES: Cue[] = [
  { start: 0.00,  end: 3.60,  text: "AI가 패턴을 분석하여 판단하고, 추론하고," },
  { start: 3.60,  end: 7.26,  text: "감으로만 풀기 어려운 복잡한 문제를 해결합니다." },
  { start: 7.66,  end: 10.64, text: "경영진, HR 임원, 모든 팀장." },
  { start: 10.80, end: 14.00, text: "각 직책에 맞는 AI 에이전트가 움직입니다." },
  { start: 15.00, end: 19.98, text: "경영진 AI 에이전트는, 전사 목표 달성수준을 모니터링하고 예측합니다." },
  { start: 21.30, end: 26.56, text: "모든 KPI를 실시간으로 모니터링하고 AI가 실적을 추정하여 보고합니다." },
  { start: 27.44, end: 34.00, text: "HR 임원 AI 에이전트 기능 중 하나는 보상 인상률 최적 배분입니다." },
  { start: 34.90, end: 39.02, text: "몰입 유형과 스킬 레벨, 인사 평가 등급과 번아웃 수준," },
  { start: 39.38, end: 44.50, text: "그리고 시장 임금까지. AI가 자동으로 크롤링해서 종합 판단합니다." },
  { start: 45.30, end: 51.92, text: "팀장 에이전트는 1대1 면담과 팀원 특성, 업무 현황을 AI가 정리하여 팀장에게 보고합니다." },
];

export const HRAgentScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/03-hr-agent.wav" background={BRAND.colors.light.bg}>
      <OpenerPhase />
      <CEOPhase />
      <HRHeadPhase />
      <TeamLeadPhase />
      <Subtitle cues={CUES} fontSize={44} bottom={70} />
    </SceneFrame>
  );
};

const usePhase = (phase: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = phase.start * fps;
  const end = phase.end * fps;
  // v11 #5: 팀장 전환 급함 피드백 → fade 6 → 14 프레임 (0.47s)
  const inP = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 14, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// v11 버그픽스: FullVideo를 Sequence로 감싸 phase 시작 시 비디오도 시작 (기존엔 씬 시작부터 재생돼 phase 진입 때 이미 끝나있었음)
const VideoPhase: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const { opacity } = usePhase(phase);
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity }}>
      <Sequence from={Math.round(phase.start * fps)}>
        <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
      </Sequence>
    </AbsoluteFill>
  );
};

const CEOPhase: React.FC     = () => <VideoPhase phase={PHASES.CEO_VIEW} />;
const HRHeadPhase: React.FC  = () => <VideoPhase phase={PHASES.HR_HEAD} />;
const TeamLeadPhase: React.FC = () => <VideoPhase phase={PHASES.TEAM_LEAD} />;
