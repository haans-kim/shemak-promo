import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { BRAND } from "../lib/brand";

// 04 Bridge (11.5s) — HR Agent + 두 축 합체
// 음성 (silence detection):
//   0~7.64s "두 축이 있다 / 옵틱 뷰 / 팬 HR" / 8.11~10.89s "세 가지가 합쳐질 때 완성"
// 피드백 #6: HeaderCopy 줄바꿈 어색 → 한 줄에 깔끔하게
// 피드백 #7: Optic View 카드가 narration보다 먼저 등장 → 매칭

const REVEAL_AT = [0.5, 4.5, 6.5]; // HR Agent / Optic View / Pan HR (narration 매칭)
const CONVERGE_AT = 8.2;

const PILLARS = [
  { key: "agent",  label: "HR Agent",   sub: "복잡한 인사 문제를 AI가 추론·실행", color: BRAND.colors.accent },
  { key: "optic",  label: "Optic View", sub: "조직의 상태를 읽는 AI",               color: "#A78BFA" },
  { key: "pan",    label: "Pan HR",     sub: "인력을 최적화하는 AI",                  color: BRAND.colors.accentWarm },
];

export const BridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const convergeFrame = CONVERGE_AT * fps;
  const converge = spring({ frame: frame - convergeFrame, fps, config: { damping: 18, stiffness: 80, mass: 1 } });

  return (
    <SceneFrame audioSrc="audio/04-bridge.mp3" background={BRAND.colors.dark.bg}>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
      }}>
        <HeaderCopy />
        <div style={{ display: "flex", gap: 60, position: "relative" }}>
          {PILLARS.map((p, i) => (
            <Pillar key={p.key} pillar={p} revealAt={REVEAL_AT[i]} convergeProgress={converge} index={i} />
          ))}
        </div>
        <ConvergedMessage progress={converge} />
      </div>
    </SceneFrame>
  );
};

const HeaderCopy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame: frame - 6, fps, config: { damping: 20, stiffness: 110 } });
  const fadeFrame = 7.5 * fps;
  const fade = interpolate(frame, [fadeFrame, fadeFrame + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = reveal * fade;
  return (
    <div style={{ textAlign: "center", opacity, padding: "0 80px", maxWidth: 1500 }}>
      {/* 한 줄로 깔끔하게 (줄바꿈 X) */}
      <div style={{ fontSize: 32, color: BRAND.colors.dark.textMuted, marginBottom: 14, lineHeight: 1.4, whiteSpace: "nowrap" }}>
        HR Agent를 <span style={{ color: BRAND.colors.dark.text, fontWeight: 600 }}>더 강력하게 만드는</span>
      </div>
      <div style={{ fontSize: 58, fontWeight: 800, color: BRAND.colors.dark.text, letterSpacing: -1, whiteSpace: "nowrap" }}>
        <span style={{ color: BRAND.colors.accentWarm }}>두 축</span>이 있습니다
      </div>
    </div>
  );
};

interface PillarProps {
  pillar: (typeof PILLARS)[number];
  revealAt: number;
  convergeProgress: number;
  index: number;
}

const Pillar: React.FC<PillarProps> = ({ pillar, revealAt, convergeProgress, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealFrame = revealAt * fps;
  const reveal = spring({ frame: frame - revealFrame, fps, config: { damping: 18, stiffness: 120 } });

  const centerOffset = (index - 1) * 300;
  const translateX = interpolate(convergeProgress, [0, 1], [0, -centerOffset]);
  const scale = interpolate(convergeProgress, [0, 1], [1, 0.7]);
  const mergeOpacity = interpolate(convergeProgress, [0, 0.7, 1], [1, 1, 0]);

  return (
    <div
      style={{
        width: 280,
        padding: 32,
        background: BRAND.colors.dark.bgElevated,
        border: `2px solid ${pillar.color}`,
        borderRadius: 20,
        textAlign: "center",
        opacity: reveal * mergeOpacity,
        transform: `translate(${translateX}px, 0) scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, color: pillar.color, marginBottom: 10 }}>
        {pillar.label}
      </div>
      <div style={{ fontSize: 14, color: BRAND.colors.dark.textMuted, lineHeight: 1.5 }}>
        {pillar.sub}
      </div>
    </div>
  );
};

const ConvergedMessage: React.FC<{ progress: number }> = ({ progress }) => {
  const opacity = interpolate(progress, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(progress, [0.6, 1], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div style={{ fontSize: 38, color: BRAND.colors.dark.textMuted }}>
        쉐막은 비로소
      </div>
      <div style={{ fontSize: 120, fontWeight: 800, color: BRAND.colors.dark.text, letterSpacing: -4 }}>
        <span style={{ color: BRAND.colors.accent }}>완성</span>됩니다
      </div>
    </div>
  );
};
