import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { BRAND } from "../lib/brand";

interface FullVideoProps {
  /** 우측 비디오 src (예: "videos/ilji-demo.webm") */
  video: string;
  /** 비디오 시작 프레임 (몇번째 프레임부터 재생) */
  videoStartFrom?: number;
  /** 영상 잘림 방지를 위해 contain. cover로 덮고 싶으면 false. */
  contain?: boolean;
  /** 자막/오버레이 children (선택) */
  children?: React.ReactNode;
}

/**
 * 풀스크린 대시보드 영상 레이아웃.
 * 영상이 잘리지 않도록 objectFit: contain 사용 (양옆 검은 패딩 가능).
 * children으로 자막/하이라이트 등 오버레이 추가.
 */
export const FullVideo: React.FC<FullVideoProps> = ({
  video,
  videoStartFrom = 0,
  contain = true,
  children,
}) => {
  return (
    <AbsoluteFill style={{ background: BRAND.colors.dark.bg }}>
      <OffthreadVideo
        src={staticFile(video)}
        startFrom={videoStartFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: contain ? "contain" : "cover",
          objectPosition: "center center",
        }}
        muted
      />
      {children}
    </AbsoluteFill>
  );
};
