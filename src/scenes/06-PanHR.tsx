import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 06 판 (17.01s) — v20 spliced audio + narration_final 통일 자막
//   M0_OPENER  0.00~6.30s   (line 1: 어느 부서가 바쁜지)
//   M1_PLAN    6.62~12.26s  (line 2~3: 인력계획 / 각 기능별 인력 동인)
//   M3_SKILL   12.78~17.01s (line 4: 개인 역량 수준)
const PHASES = {
  M0_OPENER: { start: 0.0,   end: 6.30,  video: "videos/phase31_pan_m0.webm",         videoStartFrom: 120 },
  M1_PLAN:   { start: 6.62,  end: 12.26, video: "videos/phase33_pan_m1_to_m3.webm",   videoStartFrom: 180 },
  M3_SKILL:  { start: 12.78, end: 17.01, video: "videos/phase33_pan_m1_to_m3.webm",   videoStartFrom: 540 },
};

// v20: 자막 narration_final.txt 그대로 통일
const CUES: Cue[] = [
  { start: 0.0,   end: 6.30,  text: "어느 부서가 바쁜지 구성원 스킬 부족때문은 아닌지 수시로 정리하여 보여드립니다." },
  { start: 6.62,  end: 7.60,  text: "인력계획." },
  { start: 7.84,  end: 12.26, text: "각 기능별 인력 동인을 모델링하여 향후 인력 규모를 예측합니다." },
  { start: 12.78, end: 16.70, text: "개인 역량 수준을 진단하여 필요한 조직과 매칭도 가능합니다." },
];

export const PanHRScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/06-pan-hr.wav" background={BRAND.colors.light.bg}>
      <VideoOnly phase={PHASES.M0_OPENER} />
      <VideoOnly phase={PHASES.M1_PLAN} />
      <VideoOnly phase={PHASES.M3_SKILL} />
      <Subtitle cues={CUES} fontSize={44} bottom={70} />
    </SceneFrame>
  );
};

const usePhase = (phase: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = phase.start * fps;
  const end = phase.end * fps;
  // v11 #6: M1→M3 전환 빠름 피드백 → fade 6 → 14 프레임 (0.47s)
  const inP = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(frame, [end - 14, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * outP };
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
