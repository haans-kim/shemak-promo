import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 05 Optic (34.25s) — v20 spliced audio + narration_final 통일 자막
//   TYPES       0.00~4.38s   (line 1: 설문 결과로 의식 패턴)
//   DIVERSE     5.06~13.34s  (line 2~4: 몰입도뿐 / 만족도 리더십 조직문화 / 영역별 타사)
//   RISK        13.94~18.74s (line 5: 리스크 사전 탐지)
//   WHATIF      19.56~27.24s (line 6~7: What-If / 어느 영역 개선)
//   TRANSITION  27.24~34.25s (line 8: 이어지는 판 모듈)
const PHASES = {
  TYPES:      { start: 0.0,   end: 4.38,  video: "videos/phase22_optic_ons_types.webm",  videoStartFrom: 240 },
  DIVERSE:    { start: 5.06,  end: 13.34, video: "videos/phase24_optic_cross.webm",      videoStartFrom: 0 },
  RISK:       { start: 13.94, end: 18.74, video: "videos/phase25_optic_ga_qqrisk.webm",  videoStartFrom: 0 },
  WHATIF:     { start: 19.56, end: 27.24, video: "videos/phase28_optic_ons_whatif.webm", videoStartFrom: 240 },
  TRANSITION: { start: 27.24, end: 34.25 },
};

// v20.1: 자막 가독성 — 긴 문장 의미 단위 줄바꿈
const CUES: Cue[] = [
  { start: 0.00,  end: 4.38,  text: "설문 결과로 의식 패턴을\nAI가 분석하여 유형화합니다." },
  { start: 5.06,  end: 6.68,  text: "몰입도뿐 아닙니다." },
  { start: 6.78,  end: 9.48,  text: "만족도, 리더십, 조직 문화." },
  { start: 9.96,  end: 13.34, text: "영역 별로 타사와 비교하고\n결과를 보고합니다." },
  { start: 13.94, end: 18.74, text: "리스크를 사전에 탐지하며,\n이탈 위험군을 AI가 먼저 찾아냅니다." },
  { start: 19.56, end: 20.92, text: "그리고 What-If 시뮬레이터." },
  { start: 21.98, end: 27.24, text: "어느 영역을 어느 정도 개선하면 몰입도가 개선되는지\n민감도 분석도 가능합니다." },
  { start: 27.24, end: 34.12, text: "이어지는 판 모듈과 함께 활용하면,\n진단이 곧 실행과제와 연결됩니다." },
];

export const OpticViewScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/05-optic-view.wav" background={BRAND.colors.light.bg}>
      <VideoOnly phase={PHASES.TYPES} />
      <VideoOnly phase={PHASES.DIVERSE} />
      <VideoOnly phase={PHASES.RISK} />
      <VideoOnly phase={PHASES.WHATIF} />
      <TransitionPhase />
      <Subtitle cues={CUES} fontSize={44} bottom={70} />
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
