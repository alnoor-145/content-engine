import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../brand/theme";

// Slide-in name/handle bar for the bottom of the frame.
export const LowerThird: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const scale = width / 1920;

  return (
    <div
      style={{
        position: "absolute",
        left: 80 * scale,
        bottom: 100 * scale,
        display: "flex",
        alignItems: "center",
        gap: 20 * scale,
        transform: `translateX(${interpolate(progress, [0, 1], [-600 * scale, 0])}px)`,
        opacity: progress,
      }}
    >
      <div style={{ width: 10 * scale, height: 70 * scale, background: theme.colors.primary, borderRadius: 4 }} />
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 44 * scale,
          fontWeight: 600,
          color: theme.colors.text,
          background: `${theme.colors.surface}CC`,
          padding: `${14 * scale}px ${28 * scale}px`,
          borderRadius: 12 * scale,
        }}
      >
        {text}
      </div>
    </div>
  );
};
