import { useVideoConfig } from "remotion";

// Shortest side of the frame. Size everything relative to this so one
// template looks right in 16:9, 9:16, 1:1 and 4:5.
export const useBase = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height);
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
