// IG 브랜드 토큰. 인싸이트그룹 사인규정(Logo/insightgroup 사인규정.ai)에서 추출 예정.
// TODO: 실제 브랜드 HEX·폰트명 확정되면 PLACEHOLDER 값 교체.
// 2026-04 업데이트: 피드백 반영으로 다크 모드 통일 (paper 속성은 유지하되 기본 테마를 dark로).

export const BRAND = {
  colors: {
    primary: "#0A2540",     // 딥 네이비 (섹션 기본 배경)
    primaryDark: "#050E1A", // 더 어두운 네이비
    accent: "#2EB5E5",      // 시안 / CTA
    accentWarm: "#FBBF24",  // 앰버 (강조용)
    ink: "#0B0B0B",         // 라이트 모드 텍스트
    paper: "#FFFFFF",
    // 다크 모드 토큰
    dark: {
      bg: "#0A1628",        // 메인 배경
      bgElevated: "#13243E",// 카드/패널
      border: "#1F3555",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.65)",
      textSubtle: "rgba(255,255,255,0.42)",
    },
    muted: "#6B7280",
  },
  fonts: {
    korean: `"Pretendard", "Noto Sans KR", -apple-system, sans-serif`,
    latin: `"Inter", -apple-system, sans-serif`,
  },
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;
