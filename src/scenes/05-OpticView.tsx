import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 05 Optic (30.98s) — 2026-04-21 최종본
// 0~5s    TYPES: 설문 유형화 (phase22 ons)
// 5~10s   DIVERSE: 몰입도뿐 아님, 만족도·리더십·조직문화 (phase24 cross 5유형)
// 10~18s  RISK: 타사 비교·리스크 탐지 (phase25 ga)
// 18~27s  WHATIF: 어느 영역 개선하면 민감도 분석 (phase28 ons)
// 27~31s  TRANSITION: 판 연결

const PHASES = {
  TYPES:      { start: 0.3,  end: 5.0,   video: "videos/phase22_optic_ons_types.webm",  videoStartFrom: 0 },
  DIVERSE:    { start: 5.0,  end: 10.0,  video: "videos/phase24_optic_cross.webm",      videoStartFrom: 0 },
  RISK:       { start: 10.0, end: 18.0,  video: "videos/phase25_optic_ga_qqrisk.webm",  videoStartFrom: 0 },
  WHATIF:     { start: 18.0, end: 27.0,  video: "videos/phase28_optic_ons_whatif.webm", videoStartFrom: 0 },
  TRANSITION: { start: 27.0, end: 30.98 },
};

const CUES: Cue[] = [
  { start: 0.5,  end: 4.5,  text: "설문 결과 → AI가 의식 패턴 유형화" },
  { start: 5.5,  end: 9.5,  text: "몰입도뿐 아닙니다 — 만족도 · 리더십 · 조직 문화" },
  { start: 10.5, end: 13.5, text: "영역별 타사 비교 + 결과 보고" },
  { start: 13.8, end: 17.5, text: "조직 리스크 사전 탐지 · 이탈 위험군 발굴" },
  { start: 18.5, end: 22.0, text: "What-If 시뮬레이터" },
  { start: 22.5, end: 26.5, text: "요인 개선 시 몰입도 변화 민감도 분석" },
  { start: 27.2, end: 30.5, text: "판 모듈과 함께 → 진단이 실행과제로" },
];

export const OpticViewScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/05-optic-view.mp3" background={BRAND.colors.light.bg}>
      <VideoOnly phase={PHASES.TYPES} />
      <VideoOnly phase={PHASES.DIVERSE} />
      <VideoOnly phase={PHASES.RISK} />
      <VideoOnly phase={PHASES.WHATIF} />
      <TransitionPhase />
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

const VideoOnly: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const { opacity } = usePhase(phase);
  return (
    <AbsoluteFill style={{ opacity }}>
      <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
    </AbsoluteFill>
  );
};

const TransitionPhase: React.FC = () => {
  const { opacity, frame, fps, start } = usePhase(PHASES.TRANSITION);
  const lf = frame - start;
  const reveal = spring({ frame: lf, fps, config: { damping: 20, stiffness: 110 } });
  return (
    <AbsoluteFill style={{
      opacity, background: BRAND.colors.light.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32, padding: "0 120px",
    }}>
      <div style={{
        fontSize: 42, color: BRAND.colors.light.textMuted, textAlign: "center",
        opacity: reveal,
        transform: `translateY(${interpolate(reveal, [0, 1], [20, 0])}px)`,
      }}>
        이어지는 <span style={{ color: BRAND.colors.accentWarm, fontWeight: 800 }}>판</span> 모듈과 함께
      </div>
      <div style={{
        fontSize: 64, fontWeight: 800, color: BRAND.colors.light.text, letterSpacing: -1, textAlign: "center",
        opacity: reveal,
      }}>
        진단이 곧 <span style={{ color: BRAND.colors.primary }}>실행과제</span>와 연결됩니다
      </div>
    </AbsoluteFill>
  );
};
