import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 06 Pan HR (38s) — 사용자 엑셀 매핑 기반
// 영상 매핑:
//   site-pan-skills.webm:    스킬관리 메인 → matrix → browser 시퀀스 (3 페이지 차례)
//   site-pan-workforce.webm: 워라밸 — 사이드바 클릭하며 서브메뉴 차례 노출
//   site-pan-rna.webm:       /pan-hr/planning/rna 적정인력 시뮬레이션 (슬라이더 조작)

// 사용자 피드백:
//   - 2:44 BFM 흰색 → 신규 site-bfm-demo.webm (다크모드 강제 CSS inject)
//   - 흰색 로딩 화면 건너뛰도록 startFrom 늘림
const PHASES = {
  OPENER:    { start: 0.0,  end: 4.0  },
  M3_SKILL:  { start: 4.0,  end: 14.0, video: "videos/site-bfm-demo.webm",      videoStartFrom: 150 }, // 신규 BFM 영상
  M2_WORK:   { start: 14.0, end: 20.5, video: "videos/site-pan-workforce.webm", videoStartFrom: 150 },
  M1_PLAN:   { start: 20.5, end: 32.0, video: "videos/site-pan-rna.webm",       videoStartFrom: 150 },
  M0_SYNTH:  { start: 32.0, end: 38.0 },
};

const CUES: Cue[] = [
  { start: 4.2,  end: 9.5,  text: "스킬 관리 — IG DB 기반 구축" },
  { start: 9.8,  end: 13.5, text: "BFM · OCA · 조직 역량 분석 연결" },
  { start: 14.4, end: 19.8, text: "워라밸 — 과부하 팀 AI 자동 탐지" },
  { start: 21.0, end: 24.5, text: "필요 인력 예측 — 회귀 분석 모델" },
  { start: 25.0, end: 30.0, text: "매출·자동화·퇴직 시나리오별 인력 예측" },
];

export const PanHRScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/06-pan-hr.mp3" background={BRAND.colors.dark.bg}>
      <OpenerPhase />
      <M3Phase />
      <M2Phase />
      <M1Phase />
      <M0Phase />
      <Subtitle cues={CUES} fontSize={34} bottom={70} />
    </SceneFrame>
  );
};

const useTiming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

const usePhase = (phase: { start: number; end: number }) => {
  const { frame, fps } = useTiming();
  const start = phase.start * fps;
  const end = phase.end * fps;
  const inP = interpolate(frame, [start, start + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 6, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * outP, frame, fps, start, end };
};

const MODULES = [
  { no: "M3", name: "스킬 관리",     color: "#A78BFA" },
  { no: "M2", name: "워라밸",         color: "#10B981" },
  { no: "M1", name: "필요 인력 예측", color: "#3B82F6" },
  { no: "M0", name: "종합 대시보드",   color: BRAND.colors.accentWarm },
];

// P1: Opener 풀스크린 카드 (영상 없음)
const OpenerPhase: React.FC = () => {
  const { opacity, frame, fps, start } = usePhase(PHASES.OPENER);
  const lf = frame - start;
  const title = spring({ frame: lf, fps, config: { damping: 20, stiffness: 110 } });
  const cardDelays = [1.4, 1.8, 2.2, 2.6];

  return (
    <AbsoluteFill style={{ opacity, padding: "80px 120px" }}>
      <div style={{ textAlign: "center", opacity: title, transform: `translateY(${interpolate(title, [0, 1], [15, 0])}px)` }}>
        <div style={{ fontSize: 22, color: BRAND.colors.accent, letterSpacing: 4, fontWeight: 600, marginBottom: 12 }}>
          PAN HR
        </div>
        <div style={{ fontSize: 50, fontWeight: 800, color: BRAND.colors.dark.text, lineHeight: 1.25 }}>
          인력을 최적화하는 <span style={{ color: BRAND.colors.accentWarm }}>네 가지 모듈</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20, marginTop: 60 }}>
        {MODULES.map((m, i) => {
          const r = spring({ frame: lf - cardDelays[i] * fps, fps, config: { damping: 20, stiffness: 110 } });
          return (
            <div key={m.no} style={{
              padding: 24,
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${m.color}`,
              borderRadius: 14,
              textAlign: "center",
              opacity: r,
              transform: `translateY(${interpolate(r, [0, 1], [24, 0])}px)`,
            }}>
              <div style={{ fontSize: 13, color: m.color, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>{m.no}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.colors.dark.text }}>{m.name}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 영상 phase 공통
const VideoOnlyPhase: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const { opacity } = usePhase(phase);
  return (
    <AbsoluteFill style={{ opacity }}>
      <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
    </AbsoluteFill>
  );
};

const M3Phase: React.FC = () => <VideoOnlyPhase phase={PHASES.M3_SKILL} />;
const M2Phase: React.FC = () => <VideoOnlyPhase phase={PHASES.M2_WORK} />;
const M1Phase: React.FC = () => <VideoOnlyPhase phase={PHASES.M1_PLAN} />;

// P5: M0 종합 대시보드 (풀스크린 카드)
const M0Phase: React.FC = () => {
  const { opacity, frame, fps, start } = usePhase(PHASES.M0_SYNTH);
  const lf = frame - start;
  const header = spring({ frame: lf, fps, config: { damping: 20, stiffness: 110 } });
  const merge = spring({ frame: lf - 2 * fps, fps, config: { damping: 18, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ opacity, padding: "60px 100px" }}>
      <div style={{ textAlign: "center", opacity: header, transform: `translateY(${interpolate(header, [0, 1], [15, 0])}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "6px 14px", background: `${BRAND.colors.accentWarm}22`, border: `1px solid ${BRAND.colors.accentWarm}`, borderRadius: 8, marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.colors.accentWarm, letterSpacing: 2 }}>M0</div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: BRAND.colors.dark.text }}>
          종합 대시보드
        </div>
        <div style={{ fontSize: 20, color: BRAND.colors.dark.textMuted, marginTop: 10 }}>
          조직 운영의 <span style={{ color: BRAND.colors.accentWarm, fontWeight: 700 }}>전체 그림</span>
        </div>
      </div>
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
        {[
          { label: "스킬", color: "#A78BFA" },
          { label: "워라밸", color: "#10B981" },
          { label: "인력 예측", color: "#3B82F6" },
        ].map((m) => (
          <div key={m.label} style={{
            padding: "20px 30px",
            background: `${m.color}15`,
            border: `2px solid ${m.color}`,
            borderRadius: 14,
            fontSize: 20,
            fontWeight: 700,
            color: m.color,
            opacity: interpolate(merge, [0.6, 1], [1, 0.3]),
          }}>
            {m.label}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 40,
        textAlign: "center",
        opacity: interpolate(merge, [0.7, 1], [0, 1]),
        transform: `scale(${interpolate(merge, [0.7, 1], [0.9, 1])})`,
      }}>
        <div style={{
          display: "inline-block",
          padding: "28px 50px",
          background: `${BRAND.colors.accentWarm}20`,
          border: `2px solid ${BRAND.colors.accentWarm}`,
          borderRadius: 20,
          fontSize: 34,
          fontWeight: 800,
          color: BRAND.colors.dark.text,
          boxShadow: `0 0 50px ${BRAND.colors.accentWarm}40`,
        }}>
          조직 운영 <span style={{ color: BRAND.colors.accentWarm }}>All-in-One</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
