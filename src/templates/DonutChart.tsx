import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const donutChartSchema = z.object({
  title: z.string(),
  centerLabel: z.string(),
  segments: z.array(z.object({ label: z.string(), value: z.number().positive() })).min(1),
});

const PALETTE = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D"];

// Donut/pie chart: segments sweep around one after another, legend shows percentages.
export const DonutChart: React.FC<z.infer<typeof donutChartSchema>> = ({ title, centerLabel, segments }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const size = base * 0.6;
  const r = size * 0.38;
  const C = 2 * Math.PI * r;
  const sweep = interpolate(frame, [10, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  let acc = 0;
  const arcs = segments.map((s, i) => {
    const start = acc / total;
    acc += s.value;
    const end = acc / total;
    const shown = Math.max(0, Math.min(sweep, end) - start);
    return { ...s, i, start, len: shown, pct: Math.round((s.value / total) * 100) };
  });

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.07, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.065, color: theme.colors.text }}>{title}</div>
      <AbsoluteFill style={{ flexDirection: portrait ? "column" : "row", justifyContent: "center", alignItems: "center", gap: base * 0.08, paddingTop: base * 0.1 }}>
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.16} />
            {arcs.map((a) => (
              <circle key={a.i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PALETTE[a.i % PALETTE.length]} strokeWidth={size * 0.16} strokeDasharray={`${a.len * C} ${C}`} strokeDashoffset={-a.start * C} />
            ))}
          </svg>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: theme.colors.text }}>{Math.round(sweep * 100)}%</div>
            <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.028, color: theme.colors.muted }}>{centerLabel}</div>
          </AbsoluteFill>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: base * 0.025 }}>
          {arcs.map((a) => (
            <div key={a.i} style={{ display: "flex", alignItems: "center", gap: base * 0.02, opacity: interpolate(frame, [10 + a.start * 60, 20 + a.start * 60], [0, 1], clamp) }}>
              <div style={{ width: base * 0.03, height: base * 0.03, borderRadius: base * 0.008, background: PALETTE[a.i % PALETTE.length] }} />
              <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.038, color: theme.colors.text, minWidth: base * 0.3 }}>{a.label}</div>
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.038, color: PALETTE[a.i % PALETTE.length] }}>{a.pct}%</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
