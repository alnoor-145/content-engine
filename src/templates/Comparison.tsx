import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { useBase } from "../lib/useBase";

const sideSchema = z.object({ title: z.string(), points: z.array(z.string()) });
export const comparisonSchema = z.object({ left: sideSchema, right: sideSchema });

// A vs B split screen. Side-by-side in landscape, stacked in portrait.
export const Comparison: React.FC<z.infer<typeof comparisonSchema>> = ({ left, right }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const split = spring({ frame, fps, config: { damping: 200 } });
  const vs = spring({ frame: frame - 15, fps, config: { damping: 8 } });

  const Side: React.FC<{ s: z.infer<typeof sideSchema>; color: string; delay: number }> = ({ s, color, delay }) => (
    <div style={{ flex: 1, background: `${color}22`, display: "flex", flexDirection: "column", justifyContent: "center", padding: base * 0.07, gap: base * 0.02 }}>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color }}>{s.title}</div>
      {s.points.map((pt, i) => {
        const p = interpolate(frame, [delay + i * 8, delay + i * 8 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ fontFamily: theme.fonts.body, fontSize: base * 0.042, color: theme.colors.text, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
            • {pt}
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: theme.colors.background, flexDirection: portrait ? "column" : "row" }}>
      <div style={{ display: "flex", flex: 1, transform: portrait ? `translateY(${(split - 1) * 100}%)` : `translateX(${(split - 1) * 100}%)` }}>
        <Side s={left} color={theme.colors.primary} delay={20} />
      </div>
      <div style={{ display: "flex", flex: 1, transform: portrait ? `translateY(${(1 - split) * 100}%)` : `translateX(${(1 - split) * 100}%)` }}>
        <Side s={right} color={theme.colors.secondary} delay={30} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        <div
          style={{
            width: base * 0.18,
            height: base * 0.18,
            borderRadius: "50%",
            background: theme.colors.accent,
            color: theme.colors.background,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: theme.fonts.heading,
            fontWeight: 900,
            fontSize: base * 0.07,
            transform: `scale(${vs}) rotate(${(1 - vs) * -90}deg)`,
          }}
        >
          VS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
