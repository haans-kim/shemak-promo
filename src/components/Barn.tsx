import { CSSProperties } from "react";

// 진짜 외양간 스타일 SVG 컴포넌트 — 01·08 공유
// 낮고 넓은 본체 / 입구 개방 / 짚 지붕 / 나무 판자

interface BarnProps {
  width?: number;        // px
  cowVisible?: boolean;  // 안에 소 보이게
  glow?: number;         // 0~1 (외곽 글로우 강도)
  showFence?: boolean;   // 좌우 울타리
  style?: CSSProperties;
}

export const Barn: React.FC<BarnProps> = ({
  width = 400,
  cowVisible = false,
  glow = 0,
  showFence = false,
  style = {},
}) => {
  const h = width * 0.65; // 낮고 넓은 비율 (지붕 포함)
  return (
    <div style={{
      position: "relative",
      width, height: h,
      filter: glow > 0 ? `drop-shadow(0 0 ${20 + glow * 30}px rgba(245,158,11,${0.4 + glow * 0.4}))` : "none",
      ...style,
    }}>
      <svg viewBox="0 0 400 260" width={width} height={h} style={{ overflow: "visible" }}>
        {/* 짚 지붕 (사다리꼴, 황토색 + 짚 결) */}
        <polygon
          points="40,100 360,100 320,40 80,40"
          fill="#D4A574"
          stroke="#8B6F47"
          strokeWidth="3"
        />
        {/* 짚 결 표현 (수직 라인들) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 60 + i * 26;
          return <line key={i} x1={x} y1={45 + (i % 3)} x2={x - 8} y2={98} stroke="#A88660" strokeWidth="1" opacity="0.6" />;
        })}
        {/* 본체 (낮고 넓은 — 나무 판자) */}
        <rect x="40" y="100" width="320" height="140" fill="#A0673D" stroke="#5D3A1F" strokeWidth="3" />
        {/* 나무 판자 수직선 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={80 + i * 35} y1="100" x2={80 + i * 35} y2="240" stroke="#7A4A28" strokeWidth="1.5" opacity="0.7" />
        ))}
        {/* 입구 개방 (문 없이 큰 직사각형) */}
        <rect x="155" y="125" width="90" height="115" fill={glow > 0.3 ? "#FFE5A0" : "#2A1B0E"} />
        {/* 입구 안쪽 음영 */}
        <rect x="155" y="125" width="90" height="20" fill="#1A0F08" opacity={glow > 0.3 ? 0.3 : 0.7} />
        {/* 안에 소 (cowVisible) */}
        {cowVisible && (
          <text x="200" y="210" fontSize="60" textAnchor="middle" style={{ fontFamily: "Segoe UI Emoji, sans-serif" }}>
            🐄
          </text>
        )}
        {/* 좌우 울타리 (showFence) */}
        {showFence && (
          <>
            {/* 왼쪽 울타리 */}
            <line x1="0" y1="190" x2="40" y2="190" stroke="#8B6F47" strokeWidth="6" />
            <line x1="0" y1="220" x2="40" y2="220" stroke="#8B6F47" strokeWidth="6" />
            <line x1="10" y1="170" x2="10" y2="240" stroke="#5D3A1F" strokeWidth="5" />
            <line x1="30" y1="170" x2="30" y2="240" stroke="#5D3A1F" strokeWidth="5" />
            {/* 오른쪽 울타리 */}
            <line x1="360" y1="190" x2="400" y2="190" stroke="#8B6F47" strokeWidth="6" />
            <line x1="360" y1="220" x2="400" y2="220" stroke="#8B6F47" strokeWidth="6" />
            <line x1="370" y1="170" x2="370" y2="240" stroke="#5D3A1F" strokeWidth="5" />
            <line x1="390" y1="170" x2="390" y2="240" stroke="#5D3A1F" strokeWidth="5" />
          </>
        )}
        {/* 글로우 시 입구에서 새어나오는 빛 */}
        {glow > 0.3 && (
          <ellipse cx="200" cy="240" rx="60" ry="20" fill="rgba(255,228,160,0.5)" />
        )}
      </svg>
    </div>
  );
};
