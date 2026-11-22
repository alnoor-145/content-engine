import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const statCounterSchema = z.object({
  from: z.number(),
  to: z.number(),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string(),
  decimals: z.number().int().min(0).max(4),
});

// Big counting number with a label. Set from > to for a countdown.
export const StatCounter: React.FC<z.infer<typeof statCounterSchema>> = ({ from, to, prefix, suffix, label, decimals }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const base = useBase();
  const end = Math.round(durationInFrames * 0.7);
  const value = interpolate(frame, [0, end], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) });
  const labelIn = interpolate(frame, [end - 15, end], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: 900,
            fontSize: base * 0.2,
            fontVariantNumeric: "tabular-nums",
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {prefix}
          {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          {suffix}
        </div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.05, color: theme.colors.text, opacity: labelIn, marginTop: base * 0.02 }}>
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
