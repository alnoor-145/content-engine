import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const barChartSchema = z.object({
  title: z.string(),
  unit: z.string(),
  bars: z.array(z.object({ label: z.string(), value: z.number() })),
});

const palette = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D"];

// Horizontal animated bar chart. Bars grow in a stagger and their values count up.
export const BarChart: React.FC<z.infer<typeof barChartSchema>> = ({ title, unit, bars }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ padding: base * 0.08, justifyContent: "center", gap: base * 0.03 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.07, color: theme.colors.text, opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>
          {title}
        </div>
        {bars.map((b, i) => {
          const p = spring({ frame: frame - 10 - i * 6, fps, config: { damping: 200 } });
          return (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: base * 0.02 }}>
              <div style={{ width: "22%", fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted, textAlign: "right" }}>{b.label}</div>
              <div style={{ flex: 1, height: base * 0.06, background: "rgba(255,255,255,0.06)", borderRadius: base * 0.015, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(b.value / max) * 100 * p}%`, background: palette[i % palette.length], borderRadius: base * 0.015 }} />
              </div>
              <div style={{ width: "16%", fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.035, color: theme.colors.text, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(b.value * p).toLocaleString()}
                {unit}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
