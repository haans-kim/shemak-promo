import { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../lib/brand";

// 심플 외양간 = 울타리 6막대 순차 드롭 + 🐂 (갈색 황소) + 지붕/가로보
// 01 Intro BarnStoryPhase, 08 Foundation Closer 공유

interface BarnProps {
  /** 전체 폭 (px) */
  width?: number;
  /** 소(🐂) 보이는 타이밍 — seconds relative to startAt */
  cowAt?: number;
  /** 애니메이션 시작 시점 (씬 내 seconds). startAt <= 현재 시간 일 때부터 plank 드롭 진행 */
  startAt: number;
  /** 각 plank 드롭 딜레이 (seconds, 길이=6 추천) */
  plankDelays?: number[];
  /** 글로우 (0~1) — 08 완성 후 강조용 */
  glow?: number;
  /** 가로보 + 지붕 표시 여부 (심플 외양간 완성) */
  showRoof?: boolean;
  style?: CSSProperties;
}

const DEFAULT_PLANK_DELAYS = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];

export const Barn: React.FC<BarnProps> = ({
  width = 520,
  cowAt = 0,
  startAt,
  plankDelays = DEFAULT_PLANK_DELAYS,
  glow = 0,
  showRoof = true,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startAt * fps;

  // 소(🐂) 등장
  const cowReveal = spring({
    frame: lf - cowAt * fps,
    fps,
    config: { damping: 18, stiffness: 130 },
  });

  // 가로 상단보 — 마지막 plank 이후 등장
  const maxDelay = plankDelays[plankDelays.length - 1];
  const roofReveal = spring({
    frame: lf - (maxDelay + 0.15) * fps,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const h = Math.round(width * 0.45);
  const plankCount = plankDelays.length;
  const leftPad = Math.round(width * 0.12);
  const plankSpacing = Math.round((width - leftPad * 2) / (plankCount - 1));
  const plankW = 16;
  const plankH = Math.round(h * 0.85);

  return (
    <div
      style={{
        position: "relative",
        width,
        height: h + 20,
        filter:
          glow > 0
            ? `drop-shadow(0 0 ${20 + glow * 30}px rgba(245,158,11,${0.35 + glow * 0.45}))`
            : "none",
        ...style,
      }}
    >
      {/* 🐂 소 이모지 — 울타리 뒤에 서있는 느낌, 가운데 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 14,
          transform: `translateX(-50%) scale(${interpolate(cowReveal, [0, 1], [0.7, 1])})`,
          fontSize: Math.round(width * 0.18),
          lineHeight: 1,
          opacity: cowReveal,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))",
        }}
      >
        🐂
      </div>

      {/* 6개 울타리 plank — 순차 드롭 */}
      {plankDelays.map((d, i) => {
        const drop = spring({
          frame: lf - d * fps,
          fps,
          config: { damping: 12, stiffness: 220, mass: 0.6 },
        });
        const x = leftPad + i * plankSpacing - plankW / 2;
        const translateY = interpolate(drop, [0, 1], [-200, 0]);
        const rotate = interpolate(drop, [0, 0.7, 1], [15, -5, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              bottom: 0,
              width: plankW,
              height: plankH,
              background: `linear-gradient(180deg, ${BRAND.colors.accentWarm} 0%, #B45309 100%)`,
              borderRadius: 4,
              opacity: drop,
              transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          />
        );
      })}

      {/* 가로 상단보 (모든 plank 이후 등장) */}
      {showRoof && (
        <>
          <div
            style={{
              position: "absolute",
              left: leftPad - plankW / 2,
              bottom: Math.round(plankH * 0.75),
              width: (plankCount - 1) * plankSpacing + plankW,
              height: 12,
              background: `linear-gradient(180deg, ${BRAND.colors.accentWarm} 0%, #8B4A08 100%)`,
              borderRadius: 3,
              opacity: roofReveal,
              transform: `scaleX(${interpolate(roofReveal, [0, 1], [0, 1])})`,
              transformOrigin: "left center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
            }}
          />
          {/* 아래 가로보 */}
          <div
            style={{
              position: "absolute",
              left: leftPad - plankW / 2,
              bottom: Math.round(plankH * 0.30),
              width: (plankCount - 1) * plankSpacing + plankW,
              height: 10,
              background: `linear-gradient(180deg, ${BRAND.colors.accentWarm} 0%, #8B4A08 100%)`,
              borderRadius: 3,
              opacity: roofReveal,
              transform: `scaleX(${interpolate(roofReveal, [0, 1], [0, 1])})`,
              transformOrigin: "left center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
            }}
          />
        </>
      )}
    </div>
  );
};
