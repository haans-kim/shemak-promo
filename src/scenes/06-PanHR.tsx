import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 06 판 (15.86s) — 2026-04-21 최종본 (3비트 대폭 축소)
// 0~5s    M0 opener (phase31): "어느 부서가 바쁜지 ... 수시로 정리하여 보여드립니다"
// 5~12s   M1 인력계획 (phase33 전반부): "기능별 인력 동인 → 미래 인력 규모 예측"
// 12~16s  M3 역량 (phase33 후반부): "개인 역량 수준 진단 → 필요 조직 매칭"
// ※ phase33 영상은 중간에 M3 탭 클릭 애니메이션 포함 — 그대로 활용

const PHASES = {
  M0_OPENER: { start: 0.2,  end: 5.0,   video: "videos/phase31_pan_m0.webm",         videoStartFrom: 120 }, // v10: 4s skip — 로딩 제거 후 M0 노출
  M1_PLAN:   { start: 5.0,  end: 12.0,  video: "videos/phase33_pan_m1_to_m3.webm",   videoStartFrom: 180 }, // v10: 6s skip — M1 클릭 직후부터
  M3_SKILL:  { start: 12.0, end: 15.86, video: "videos/phase33_pan_m1_to_m3.webm",   videoStartFrom: 540 }, // v10: 18s skip — M3 실제 등장 시점
};

const CUES: Cue[] = [
  { start: 0.5,  end: 4.5,  text: "판 — 어느 부서가 바쁜지, 왜 바쁜지, 스킬 수준까지 AI 정리" },
  { start: 5.5,  end: 11.5, text: "M1 인력계획 — 기능별 인력 동인 모델링 · 미래 규모 예측" },
  { start: 12.3, end: 15.5, text: "M3 스킬 매칭 — 개인 역량 진단 · 필요 조직과 매칭" },
];

export const PanHRScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/06-pan-hr.mp3" background={BRAND.colors.light.bg}>
      <VideoOnly phase={PHASES.M0_OPENER} />
      <VideoOnly phase={PHASES.M1_PLAN} />
      <VideoOnly phase={PHASES.M3_SKILL} />
      <Subtitle cues={CUES} fontSize={32} bottom={70} />
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
