import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { BRAND } from "../lib/brand";

interface SplitLayoutProps {
  /** 좌측 영역 (텍스트/카드) */
  left: React.ReactNode;
  /** 우측 비디오 src (예: "videos/ilji-demo.webm") */
  video: string;
  /** 비디오 시작 프레임 (몇번째 프레임부터 재생) */
  videoStartFrom?: number;
  /** 좌:우 비율 (기본 0.4) */
  leftRatio?: number;
}

/**
 * 좌측 텍스트 + 우측 대시보드 영상 분할 레이아웃.
 * 03 HR Agent, 05 Optic View, 06 Pan HR scene에서 phase별로 사용.
 */
export const SplitLayout: React.FC<SplitLayoutProps> = ({
  left,
  video,
  videoStartFrom = 0,
  leftRatio = 0.4,
}) => {
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "stretch" }}>
      {/* 좌측 텍스트 영역 */}
      <div style={{
        flex: leftRatio,
        padding: "60px 50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: BRAND.colors.dark.bg,
        zIndex: 2,
      }}>
        {left}
      </div>

      {/* 우측 비디오 영역 */}
      <div style={{
        flex: 1 - leftRatio,
        position: "relative",
        overflow: "hidden",
        background: BRAND.colors.dark.bgElevated,
        borderLeft: `1px solid ${BRAND.colors.dark.border}`,
      }}>
        <OffthreadVideo
          src={staticFile(video)}
          startFrom={videoStartFrom}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top" }}
          muted
        />
        {/* 살짝 어두운 그라디언트 오버레이로 좌측과 자연스럽게 연결 */}
        <AbsoluteFill style={{
          background: `linear-gradient(90deg, ${BRAND.colors.dark.bg} 0%, transparent 8%)`,
          pointerEvents: "none",
        }}/>
      </div>
    </AbsoluteFill>
  );
};
