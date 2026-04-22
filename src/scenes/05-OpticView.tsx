import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
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

// v10 피드백: 02:01 What-If 화면 전환 빠르게, 01:53 RISK 화면 부적절 → phase25 변경 예정 (재녹화)
// silences: @4.34 / @12.29 / @19.11 / @23.64 / @28.25
const PHASES = {
  TYPES:      { start: 0.3,  end: 4.5,   video: "videos/phase22_optic_ons_types.webm",  videoStartFrom: 240 }, // v10: 8s skip — 4카드 sweep 구간 노출
  DIVERSE:    { start: 4.5,  end: 12.5,  video: "videos/phase24_optic_cross.webm",      videoStartFrom: 0 },
  RISK:       { start: 12.5, end: 18.8,  video: "videos/phase25_optic_ga_qqrisk.webm",  videoStartFrom: 0 },
  WHATIF:     { start: 18.8, end: 28.5,  video: "videos/phase28_optic_ons_whatif.webm", videoStartFrom: 240 }, // v10: 8s skip — 슬라이더 드래그 구간 노출
  TRANSITION: { start: 28.5, end: 30.98 },
};

const CUES: Cue[] = [
  { start: 0.5,  end: 4.0,  text: "설문 결과 → AI가 의식 패턴 유형화" },
  { start: 5.0,  end: 8.5,  text: "몰입도뿐 아닙니다 — 만족도 · 리더십 · 조직 문화" },
  { start: 9.0,  end: 12.0, text: "영역별 타사 비교 + 결과 보고" },
  { start: 13.0, end: 18.5, text: "리스크 사전 탐지 · 이탈 위험군 발굴" },
  { start: 20.0, end: 22.5, text: "What-If 시뮬레이터" },
  { start: 23.0, end: 28.0, text: "요인 개선 시 몰입도 변화 민감도 분석" },
  { start: 28.7, end: 30.8, text: "판 모듈과 함께 → 진단이 실행과제로" },
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

// v11: Sequence 래핑으로 phase 시작과 비디오 재생 시작 동기화
const VideoOnly: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
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
