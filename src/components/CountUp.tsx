import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  from: number;
  to: number;
  durationInSeconds: number;
  startAtSeconds?: number;
  format?: (n: number) => string;
}

export const CountUp: React.FC<Props> = ({
  from,
  to,
  durationInSeconds,
  startAtSeconds = 0,
  format = (n) => Math.round(n).toLocaleString("ko-KR"),
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = startAtSeconds * fps;
  const endFrame = startFrame + durationInSeconds * fps;

  const value = interpolate(frame, [startFrame, endFrame], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <span>{format(value)}</span>;
};
