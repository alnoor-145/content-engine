import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../brand/theme";

// Animated gradient background with slowly drifting glow orbs.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (speed: number, range: number) => Math.sin(frame * speed) * range;
  const size = Math.max(width, height) * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, overflow: "hidden" }}>
      <Orb color={theme.colors.primary} size={size} x={width * 0.15 + drift(0.02, 80)} y={height * 0.2 + drift(0.015, 60)} />
      <Orb color={theme.colors.secondary} size={size} x={width * 0.85 + drift(0.018, 90)} y={height * 0.8 + drift(0.022, 70)} />
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 20], [0, 0.08], { extrapolateRight: "clamp" }),
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
};

const Orb: React.FC<{ color: string; size: number; x: number; y: number }> = ({ color, size, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}55 0%, transparent 65%)`,
      filter: "blur(40px)",
    }}
  />
);
