import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface CursorWaypoint {
  /** 시점 (씬 기준 초) */
  t: number;
  /** 화면 위치 (0~1 정규화, 1920×1080 기준 비율) */
  x: number;
  y: number;
  /** 이 시점에 클릭 효과 (true면 ripple 표시) */
  click?: boolean;
}

interface Props {
  waypoints: CursorWaypoint[];
  /** show/hide 시간 (선택) */
  showFrom?: number;
  showTo?: number;
}

/**
 * 영상 위에 마우스 커서 오버레이.
 * waypoints 사이를 부드럽게 이동, click=true 시점에 ripple.
 * 좌표는 0~1 비율 (예: x=0.5는 화면 가로 중앙).
 */
export const MouseCursor: React.FC<Props> = ({ waypoints, showFrom, showTo }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  if (showFrom !== undefined && t < showFrom) return null;
  if (showTo !== undefined && t > showTo) return null;
  if (waypoints.length === 0) return null;

  // 현재 위치 — waypoints 사이 보간
  let x = waypoints[0].x;
  let y = waypoints[0].y;
  if (t <= waypoints[0].t) {
    x = waypoints[0].x;
    y = waypoints[0].y;
  } else if (t >= waypoints[waypoints.length - 1].t) {
    x = waypoints[waypoints.length - 1].x;
    y = waypoints[waypoints.length - 1].y;
  } else {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      if (t >= a.t && t <= b.t) {
        const p = (t - a.t) / (b.t - a.t);
        // ease-in-out
        const eased = p * p * (3 - 2 * p);
        x = a.x + (b.x - a.x) * eased;
        y = a.y + (b.y - a.y) * eased;
        break;
      }
    }
  }

  const px = x * width;
  const py = y * height;

  // 가까운 click 효과
  const clickWp = waypoints.find(wp => wp.click && Math.abs(t - wp.t) < 0.5);
  let ripple = 0;
  if (clickWp) {
    const dt = t - clickWp.t;
    if (dt >= 0 && dt < 0.5) {
      ripple = interpolate(dt, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
  }

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 60,
    }}>
      {/* ripple */}
      {ripple > 0 && (
        <div style={{
          position: "absolute",
          left: px,
          top: py,
          width: 80 * ripple,
          height: 80 * ripple,
          marginLeft: -40 * ripple,
          marginTop: -40 * ripple,
          borderRadius: "50%",
          border: "3px solid rgba(255, 255, 255, 0.9)",
          background: "rgba(251, 191, 36, 0.25)",
          opacity: 1 - ripple,
        }}/>
      )}
      {/* cursor (간단 SVG arrow) */}
      <svg
        width="32"
        height="40"
        viewBox="0 0 32 40"
        style={{
          position: "absolute",
          left: px,
          top: py,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        }}
      >
        <path
          d="M 2,2 L 2,28 L 9,22 L 14,34 L 19,32 L 14,20 L 24,20 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
