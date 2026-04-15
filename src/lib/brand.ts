// IG 브랜드 토큰. 인싸이트그룹 사인규정(Logo/insightgroup 사인규정.ai)에서 추출 예정.
// TODO: 실제 브랜드 HEX·폰트명 확정되면 PLACEHOLDER 값 교체.

export const BRAND = {
  colors: {
    primary: "#0A2540",     // PLACEHOLDER — 딥 네이비 계열 가정
    accent: "#2EB5E5",      // PLACEHOLDER — 시안 계열 가정
    ink: "#0B0B0B",
    paper: "#FFFFFF",
    muted: "#6B7280",
  },
  fonts: {
    // TODO: 사인규정 확인 후 교체. 우선 시스템 폰트 fallback.
    korean: `"Pretendard", "Noto Sans KR", -apple-system, sans-serif`,
    latin: `"Inter", -apple-system, sans-serif`,
  },
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;
