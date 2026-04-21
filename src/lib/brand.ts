// IG 브랜드 토큰.
// 2026-04-21: 라이트모드 통일 (사용자 결정). dark 토큰은 폐기, light 기본.

export const BRAND = {
  colors: {
    primary: "#1E40AF",     // 딥 블루 (섹션 포인트 컬러)
    primaryDark: "#0A2540",
    accent: "#2EB5E5",      // 시안
    accentWarm: "#F59E0B",  // 앰버 (강조·외양간)
    ink: "#0B0B0B",
    paper: "#FFFFFF",
    // 라이트 모드 토큰 (기본)
    light: {
      bg: "#FFFFFF",          // 메인 배경 흰색
      bgSoft: "#F9FAFB",      // 약한 그레이
      bgElevated: "#F3F4F6",  // 카드/패널
      border: "#E5E7EB",
      text: "#111827",
      textMuted: "#4B5563",
      textSubtle: "#9CA3AF",
    },
    // 다크 모드 토큰 (기존 호환용 — 새 작업에서는 light 사용)
    dark: {
      bg: "#FFFFFF",          // ← 라이트모드 강제: 기존 씬 수정 최소화 위해 dark.bg도 흰색으로 alias
      bgElevated: "#F3F4F6",
      border: "#E5E7EB",
      text: "#111827",
      textMuted: "#4B5563",
      textSubtle: "#9CA3AF",
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
