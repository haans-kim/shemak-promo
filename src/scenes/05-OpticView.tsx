import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { FullVideo } from "../components/FullVideo";
import { Subtitle, Cue } from "../components/Subtitle";
import { BRAND } from "../lib/brand";

// 05 Optic View (56s) — 사용자 엑셀 매핑 기반 영상 분배
// 영상 매핑:
//   site-optic-ons.webm:  ONS 다크모드 (Survey 6지표 + 4가지 몰입 유형 + 조직별 비중 + What-If)
//   site-optic-view.webm: 메인 카드 그리드 (M&A·일탈·RAG 등 7가지 분석 사례)
//   site-optic-da.webm:   조직 리스크 조기탐지 대시보드 (671명, 18.8%, 3개년 종단)
//   site-optic-ba.webm:   RAG 기반 AI 가설 자동생성 PoC (설문+인사제도+보상)
//   ※ optic-ons.webm 끝부분에 What-If 슬라이더 조작 포함

// 사용자 피드백:
//   - 1:38 흰색→검정 전환 → INTRO startFrom 60 → 150 (5s, 페이지 로딩 흰화면 건너뜀)
//   - 2:28 What-If 시연 부족 → 신규 site-whatif-demo.webm (슬라이더 천천히 + 차트 변화)
const PHASES = {
  INTRO:     { start: 0.3,  end: 9.0,  video: "videos/site-optic-ons.webm",  videoStartFrom: 150 },
  DIVERSE:   { start: 9.0,  end: 17.0, video: "videos/site-optic-ons.webm",  videoStartFrom: 240 },
  DEVIATION: { start: 17.0, end: 24.0, video: "videos/site-optic-view.webm", videoStartFrom: 150 },
  DA_DETAIL: { start: 24.0, end: 29.0, video: "videos/site-optic-da.webm",   videoStartFrom: 150 },
  RAG:       { start: 29.0, end: 42.5, video: "videos/site-optic-ba.webm",   videoStartFrom: 120 },
  WHATIF:    { start: 42.5, end: 56.0, video: "videos/site-whatif-demo.webm", videoStartFrom: 90 }, // 신규
};

const CUES: Cue[] = [
  { start: 0.5,  end: 5.0,  text: "조직의 의식 데이터 분석" },
  { start: 5.5,  end: 8.5,  text: "AI · 4가지 몰입 유형 분류" },
  { start: 9.5,  end: 13.0, text: "만족도 · 리더십 · 조직 문화" },
  { start: 13.5, end: 16.7, text: "조직마다 고유한 유형 체계" },
  { start: 17.5, end: 20.5, text: "두 가지 분석: 몰입 패턴 · 일탈 추정" },
  { start: 21.0, end: 24.0, text: "M&A 통합 · 조직 리스크 조기 탐지" },
  { start: 25.0, end: 28.5, text: "이탈 위험군을 AI가 먼저 찾아냅니다" },
  { start: 29.5, end: 35.0, text: "RAG 기반 — 임원별 과제 자동 추출" },
  { start: 35.5, end: 41.5, text: "누가, 무엇을, 왜 — 진단에서 처방까지" },
  { start: 42.5, end: 46.0, text: "What-If 시뮬레이터" },
  { start: 46.5, end: 54.5, text: "요인을 바꾸면 몰입도 변화 실시간 예측" },
];

export const OpticViewScene: React.FC = () => {
  return (
    <SceneFrame audioSrc="audio/05-optic-view.mp3" background={BRAND.colors.dark.bg}>
      <Phase phase={PHASES.INTRO} />
      <Phase phase={PHASES.DIVERSE} />
      <Phase phase={PHASES.DEVIATION} />
      <Phase phase={PHASES.DA_DETAIL} />
      <Phase phase={PHASES.RAG} />
      <Phase phase={PHASES.WHATIF} />
      <Subtitle cues={CUES} fontSize={34} bottom={70} />
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
  return inP * outP;
};

const Phase: React.FC<{ phase: { start: number; end: number; video: string; videoStartFrom: number } }> = ({ phase }) => {
  const opacity = usePhase(phase);
  return (
    <AbsoluteFill style={{ opacity }}>
      <FullVideo video={phase.video} videoStartFrom={phase.videoStartFrom} />
    </AbsoluteFill>
  );
};
