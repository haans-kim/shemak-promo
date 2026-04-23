import { CSSProperties } from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface BarnImageProps {
  /** 이미지 폭 (px) — 높이는 aspect ratio 유지 */
  width?: number;
  /** 씬 내 등장 시작 시점 (초) */
  startAt: number;
  /** 등장 연출 — drop: 위에서 낙하, fade-scale: 페이드+스케일업 */
  entrance?: "drop" | "fade-scale";
  /** 주황 glow pulse 여부 (08 Closer용) */
  glow?: boolean;
  style?: CSSProperties;
}

// 외양간 사진 기반 래퍼.
// - PNG 원본은 그대로 사용, 테두리만 CSS mask로 사각 vignette 페이드 (V3: 22~78%)
// - glow 옵션은 이미지 뒤 radial-gradient 분리 레이어 (mask가 drop-shadow를 잠식하는 문제 회피)
// - Remotion 렌더이므로 CSS animation 대신 frame-based oscillation 사용
export const BarnImage: React.FC<BarnImageProps> = ({
  width = 600,
  startAt,
  entrance = "fade-scale",
  glow = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startAt * fps;

  // Entrance
  const reveal = spring({ frame: lf, fps, config: { damping: 18, stiffness: 110 } });
  const dropY = interpolate(reveal, [0, 1], [-80, 0]);
  const scale = interpolate(reveal, [0, 1], [0.85, 1]);

  const entranceStyle: CSSProperties =
    entrance === "drop"
      ? { opacity: reveal, transform: `translateY(${dropY}px)` }
      : { opacity: reveal, transform: `scale(${scale})` };

  // Glow breathe — 2.4s 주기, opacity 0.85↔1.00, scale 0.96↔1.06
  const breathePeriod = 2.4;
  const t = lf / fps;
  const osc = (Math.sin((t / breathePeriod) * Math.PI * 2) + 1) / 2; // 0~1
  const glowOpacity = reveal * (0.85 + osc * 0.15);
  const glowScale = 0.96 + osc * 0.10;

  const maskCss: CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
    maskComposite: "intersect",
  } as CSSProperties;

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: "-18%",
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, rgba(245,158,11,0.75) 0%, rgba(245,158,11,0.35) 35%, transparent 72%)",
            filter: "blur(30px)",
            opacity: glowOpacity,
            transform: `scale(${glowScale})`,
          }}
        />
      )}
      <Img
        src={staticFile("images/barn.png")}
        style={{
          position: "relative",
          zIndex: 2,
          width,
          height: "auto",
          display: "block",
          ...maskCss,
          ...entranceStyle,
        }}
      />
    </div>
  );
};
