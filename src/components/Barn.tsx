import { CSSProperties } from "react";

// 따뜻한 일러스트 스타일 외양간 — 01·08 공유
// v11: "소 잃고 외양간 고친다" 분위기 — 귀여운 갈색 소 + 목조 외양간
// 참고 이미지: 따뜻한 amber 배경, 둥근 윤곽, 교훈적 톤

interface BarnProps {
  width?: number;        // px
  cowVisible?: boolean;  // 소를 바깥(앞쪽)에 배치
  glow?: number;         // 0~1 (외곽 글로우 강도)
  showFence?: boolean;   // 좌우 울타리
  style?: CSSProperties;
}

export const Barn: React.FC<BarnProps> = ({
  width = 500,
  cowVisible = false,
  glow = 0,
  showFence = false,
  style = {},
}) => {
  const vbW = 500, vbH = 360;
  const h = width * (vbH / vbW);
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        filter:
          glow > 0
            ? `drop-shadow(0 0 ${20 + glow * 30}px rgba(245,158,11,${0.4 + glow * 0.4}))`
            : "none",
        ...style,
      }}
    >
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width={width} height={h} style={{ overflow: "visible" }}>
        {/* ──────────── 땅 (soft shadow line) ──────────── */}
        <ellipse cx={vbW / 2} cy="340" rx="220" ry="10" fill="rgba(120,75,30,0.15)" />

        {/* ──────────── 좌우 울타리 ──────────── */}
        {showFence && (
          <>
            {/* 왼쪽 울타리 — 가로 2개 + 세로 말뚝 2개 */}
            <g stroke="#7B4A1F" strokeWidth="6" strokeLinecap="round">
              <line x1="0" y1="260" x2="90" y2="260" />
              <line x1="0" y1="290" x2="90" y2="290" />
              <line x1="20" y1="240" x2="20" y2="320" />
              <line x1="60" y1="240" x2="60" y2="320" />
            </g>
            {/* 오른쪽 울타리 */}
            <g stroke="#7B4A1F" strokeWidth="6" strokeLinecap="round">
              <line x1="410" y1="260" x2="500" y2="260" />
              <line x1="410" y1="290" x2="500" y2="290" />
              <line x1="440" y1="240" x2="440" y2="320" />
              <line x1="480" y1="240" x2="480" y2="320" />
            </g>
          </>
        )}

        {/* ──────────── 외양간 (뒤쪽 배경) ──────────── */}
        <BarnBuilding glow={glow} />

        {/* ──────────── 소 (바깥 앞쪽, 외양간 왼쪽) ──────────── */}
        {cowVisible && <Cow />}

        {/* 글로우 시 외양간 안에서 새어나오는 빛 */}
        {glow > 0.3 && (
          <ellipse
            cx="355"
            cy="310"
            rx="70"
            ry="14"
            fill="rgba(255,220,130,0.55)"
          />
        )}
      </svg>
    </div>
  );
};

// ──────────── 외양간 서브 컴포넌트 ────────────
const BarnBuilding: React.FC<{ glow: number }> = ({ glow }) => {
  // 외양간: 오른쪽에 배치 (x=220~490)
  const doorOpen = glow > 0.3;
  return (
    <g>
      {/* A-frame 지붕 (삼각형, 짙은 갈색) */}
      <polygon
        points="230,150 490,150 490,160 440,90 280,90 230,160"
        fill="#5D3A1F"
        stroke="#3E2612"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 지붕 나무판자 결 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={280 + i * 32}
          y1={90 + i * 2}
          x2={280 + i * 32 - 8}
          y2={150}
          stroke="#3E2612"
          strokeWidth="1.5"
          opacity="0.4"
        />
      ))}
      {/* 지붕 앞 박공 (작은 환기창) */}
      <rect x="345" y="110" width="30" height="22" fill="#3E2612" rx="2" />
      <line x1="360" y1="110" x2="360" y2="132" stroke="#5D3A1F" strokeWidth="1.5" />
      <line x1="345" y1="121" x2="375" y2="121" stroke="#5D3A1F" strokeWidth="1.5" />

      {/* 본체 벽 (사각형, 붉은 갈색) */}
      <rect
        x="240"
        y="150"
        width="240"
        height="170"
        fill="#A85D2E"
        stroke="#5D3A1F"
        strokeWidth="3"
      />
      {/* 수직 판자 결 */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line
          key={i}
          x1={270 + i * 30}
          y1="150"
          x2={270 + i * 30}
          y2="320"
          stroke="#7B4226"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}

      {/* 출입문 (두 쪽 문, 입구 큰 직사각형) */}
      <rect
        x="320"
        y="190"
        width="80"
        height="130"
        fill={doorOpen ? "#FFE5A0" : "#3E2612"}
        stroke="#2B1908"
        strokeWidth="3"
      />
      {/* 문 가운데 분할선 */}
      <line x1="360" y1="190" x2="360" y2="320" stroke="#2B1908" strokeWidth="3" />
      {/* X-cross 무늬 (양쪽 문) */}
      {!doorOpen && (
        <>
          <line x1="320" y1="190" x2="360" y2="320" stroke="#5D3A1F" strokeWidth="2.5" />
          <line x1="360" y1="190" x2="320" y2="320" stroke="#5D3A1F" strokeWidth="2.5" />
          <line x1="360" y1="190" x2="400" y2="320" stroke="#5D3A1F" strokeWidth="2.5" />
          <line x1="400" y1="190" x2="360" y2="320" stroke="#5D3A1F" strokeWidth="2.5" />
        </>
      )}
      {/* 문 손잡이 */}
      <circle cx="352" cy="255" r="3" fill="#2B1908" />
      <circle cx="368" cy="255" r="3" fill="#2B1908" />
    </g>
  );
};

// ──────────── 소 서브 컴포넌트 ────────────
const Cow: React.FC = () => {
  // 소: 왼쪽 앞 배치 (x=50~280, y=170~340)
  return (
    <g>
      {/* 몸통 (크고 둥근 타원) */}
      <ellipse cx="160" cy="270" rx="95" ry="58" fill="#C8864E" stroke="#6B3E1A" strokeWidth="3" />
      {/* 몸통 옆면 음영 (조금 더 어둡게) */}
      <ellipse cx="160" cy="285" rx="88" ry="42" fill="#AE6D3A" opacity="0.4" />
      {/* 뒷다리 (오른쪽) */}
      <rect x="215" y="310" width="20" height="30" fill="#C8864E" stroke="#6B3E1A" strokeWidth="2.5" rx="2" />
      <ellipse cx="225" cy="340" rx="12" ry="6" fill="#3E2612" />
      {/* 앞다리 (오른쪽) */}
      <rect x="170" y="310" width="20" height="30" fill="#C8864E" stroke="#6B3E1A" strokeWidth="2.5" rx="2" />
      <ellipse cx="180" cy="340" rx="12" ry="6" fill="#3E2612" />
      {/* 뒷다리 (왼쪽, 가려짐) */}
      <rect x="115" y="312" width="18" height="28" fill="#AE6D3A" stroke="#6B3E1A" strokeWidth="2" rx="2" />
      <ellipse cx="124" cy="340" rx="11" ry="5" fill="#3E2612" />
      {/* 앞다리 (왼쪽, 가려짐) */}
      <rect x="85" y="312" width="18" height="28" fill="#AE6D3A" stroke="#6B3E1A" strokeWidth="2" rx="2" />
      <ellipse cx="94" cy="340" rx="11" ry="5" fill="#3E2612" />

      {/* 꼬리 (몸통 뒤쪽) */}
      <path
        d="M 250 260 Q 275 250 280 275 Q 283 295 270 295"
        stroke="#6B3E1A"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="269" cy="298" rx="7" ry="9" fill="#3E2612" />

      {/* 머리 (왼쪽 앞, 몸통보다 약간 위) */}
      <ellipse cx="85" cy="230" rx="48" ry="40" fill="#C8864E" stroke="#6B3E1A" strokeWidth="3" />
      {/* 머리 앞면 하이라이트 */}
      <ellipse cx="70" cy="235" rx="35" ry="30" fill="#D69D65" opacity="0.7" />
      {/* 뿔 (왼쪽) */}
      <path d="M 55 195 Q 40 175 35 160 Q 45 170 65 195 Z" fill="#F4E4C4" stroke="#8B6F47" strokeWidth="2" strokeLinejoin="round" />
      {/* 뿔 (오른쪽) */}
      <path d="M 105 195 Q 120 175 125 160 Q 115 170 100 195 Z" fill="#F4E4C4" stroke="#8B6F47" strokeWidth="2" strokeLinejoin="round" />
      {/* 귀 (왼쪽) */}
      <ellipse cx="48" cy="212" rx="12" ry="16" fill="#C8864E" stroke="#6B3E1A" strokeWidth="2" transform="rotate(-25 48 212)" />
      <ellipse cx="48" cy="215" rx="6" ry="10" fill="#F4B8A0" transform="rotate(-25 48 215)" />
      {/* 귀 (오른쪽) */}
      <ellipse cx="122" cy="212" rx="12" ry="16" fill="#C8864E" stroke="#6B3E1A" strokeWidth="2" transform="rotate(25 122 212)" />
      <ellipse cx="122" cy="215" rx="6" ry="10" fill="#F4B8A0" transform="rotate(25 122 215)" />
      {/* 눈 (왼쪽 - 측면 보니까 하나만 보임) */}
      <ellipse cx="72" cy="223" rx="4" ry="5" fill="#1B0E05" />
      <ellipse cx="73" cy="221" rx="1.5" ry="1.5" fill="white" />
      {/* 눈 (오른쪽 작게) */}
      <ellipse cx="105" cy="223" rx="3.5" ry="4.5" fill="#1B0E05" />
      <ellipse cx="106" cy="221" rx="1.3" ry="1.3" fill="white" />
      {/* 코/주둥이 */}
      <ellipse cx="62" cy="252" rx="22" ry="15" fill="#F4B8A0" stroke="#6B3E1A" strokeWidth="2" />
      <ellipse cx="56" cy="250" rx="2.5" ry="3" fill="#2B1908" />
      <ellipse cx="68" cy="250" rx="2.5" ry="3" fill="#2B1908" />
      {/* 입 (짧은 미소 선) */}
      <path d="M 56 262 Q 62 266 68 262" stroke="#6B3E1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* 몸통 얼룩 (옵션 — 흰 반점 2개) */}
      <ellipse cx="185" cy="255" rx="18" ry="13" fill="#F4E4C4" opacity="0.85" />
      <ellipse cx="135" cy="285" rx="12" ry="9" fill="#F4E4C4" opacity="0.85" />
    </g>
  );
};
