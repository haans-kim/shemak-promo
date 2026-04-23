import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface Cue {
  /** 시작 시간 (초, 씬 기준) */
  start: number;
  /** 종료 시간 (초, 씬 기준) */
  end: number;
  /** 자막 텍스트 (줄바꿈은 \n) */
  text: string;
}

interface Props {
  cues: Cue[];
  /** 폰트 크기 (px). 기본 44. */
  fontSize?: number;
  /** 하단에서 떨어진 거리 (px). 기본 80. */
  bottom?: number;
}

/**
 * 화면 하단 중앙 자막 (텍스트만, 배경 없음).
 * 각 cue는 start~end 동안 보이며 양 끝에 0.2s fade.
 * 부모 가로 80% 박스 안에서 줄바꿈.
 */
export const Subtitle: React.FC<Props> = ({ cues, fontSize = 44, bottom = 80 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fade = 0.2;

  // 현재 시점에 활성화된 cue 한 개만 렌더 (겹침 방지 단순화)
  const active = cues.find(c => t >= c.start - fade && t <= c.end + fade);
  if (!active) return null;

  const opacity = interpolate(
    t,
    [active.start - fade, active.start, active.end, active.end + fade],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{
      position: "absolute",
      left: "50%",
      bottom,
      transform: "translateX(-50%)",
      width: "min(1500px, 85%)",
      textAlign: "center",
      pointerEvents: "none",
      zIndex: 50,
      opacity,
    }}>
      <div
        style={{
          whiteSpace: "pre-line",
          fontSize,
          fontWeight: 800,             // v16: 700 → 800 (가독성)
          color: "#000000",            // v16: 흰 → 검정 단색 (사용자 선택 B)
          lineHeight: 1.4,
          letterSpacing: -0.3,
          textShadow: "0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)", // 대시보드 배경 대비용 흰 글로우 미세하게
          wordBreak: "keep-all",
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
