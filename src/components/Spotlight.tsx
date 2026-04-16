import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  /** 강조 영역 (0~1 비율) */
  x: number;
  y: number;
  width: number;
  height: number;
  /** 표시 시간 (씬 기준 초) */
  from: number;
  to: number;
  /** 어두운 정도 0~1 (기본 0.55 — 영상 위 어둡지만 보이게) */
  dim?: number;
  /** 박스 라운드 (px, 기본 12) */
  borderRadius?: number;
  /** fade in/out (초) */
  fade?: number;
}

/**
 * 영상 위에 spotlight — 강조 영역만 그대로 두고, 그 외 영역 어둡게.
 * 강조 영역 가장자리에 노란 글로우 추가.
 */
export const Spotlight: React.FC<Props> = ({
  x, y, width: w, height: h,
  from, to,
  dim = 0.55,
  borderRadius = 12,
  fade = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;

  if (t < from - fade || t > to + fade) return null;

  const opacity = interpolate(
    t,
    [from - fade, from, to, to + fade],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const px = x * W;
  const py = y * H;
  const pw = w * W;
  const ph = h * H;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 55,
      opacity,
    }}>
      {/* 어두운 마스크 — 강조 영역만 잘라냄 */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <mask id="spot-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={px}
              y={py}
              width={pw}
              height={ph}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`rgba(0,0,0,${dim})`}
          mask="url(#spot-mask)"
        />
      </svg>
      {/* 강조 영역 외곽 글로우 */}
      <div style={{
        position: "absolute",
        left: px,
        top: py,
        width: pw,
        height: ph,
        borderRadius,
        boxShadow: "0 0 0 3px rgba(251, 191, 36, 0.85), 0 0 40px rgba(251, 191, 36, 0.45)",
      }}/>
    </div>
  );
};
