import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const barChartRaceSchema = z.object({
  title: z.string(),
  unit: z.string(),
  steps: z.array(z.object({ label: z.string(), values: z.record(z.string(), z.number()) })).min(2),
  framesPerStep: z.number().int().positive(),
  topN: z.number().int().min(2).max(12),
});

const PALETTE = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D", "#FF6BD6", "#6BFF6B"];

// "Most popular X over time" bar chart race: values interpolate, bars overtake each other.
export const BarChartRace: React.FC<z.infer<typeof barChartRaceSchema>> = ({ title, unit, steps, framesPerStep, topN }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const names = Array.from(new Set(steps.flatMap((s) => Object.keys(s.values))));
  const stepF = Math.min(Math.max(frame - 15, 0) / framesPerStep, steps.length - 1);
  const i0 = Math.floor(stepF);
  const i1 = Math.min(i0 + 1, steps.length - 1);
  const t = Easing.inOut(Easing.cubic)(stepF - i0);

  const rankIn = (i: number) => {
    const sorted = [...names].sort((a, b) => (steps[i].values[b] ?? 0) - (steps[i].values[a] ?? 0));
    return Object.fromEntries(sorted.map((n, r) => [n, r]));
  };
  const r0 = rankIn(i0);
  const r1 = rankIn(i1);
  const rows = names.map((n) => ({
    name: n,
    value: (steps[i0].values[n] ?? 0) * (1 - t) + (steps[i1].values[n] ?? 0) * t,
    rank: r0[n] * (1 - t) + r1[n] * t,
    color: PALETTE[names.indexOf(n) % PALETTE.length],
  }));
  const max = Math.max(...rows.map((r) => r.value), 1);
  const areaTop = base * 0.2;
  const rowH = (height - areaTop - base * 0.12) / topN;
  const labelW = width * 0.22;
  const barMax = width - labelW - base * 0.3;

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: base * 0.06, top: base * 0.06, fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.06, color: theme.colors.text }}>{title}</div>
      {rows.map((r) => (
        <div key={r.name} style={{ position: "absolute", left: base * 0.06, top: areaTop + r.rank * rowH, height: rowH * 0.78, display: "flex", alignItems: "center", gap: base * 0.015, opacity: interpolate(r.rank, [topN - 1, topN], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ width: labelW, textAlign: "right", fontFamily: theme.fonts.body, fontWeight: 600, fontSize: Math.min(rowH * 0.4, base * 0.04), color: theme.colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
          <div style={{ width: (r.value / max) * barMax, height: "100%", background: r.color, borderRadius: base * 0.01 }} />
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: Math.min(rowH * 0.38, base * 0.036), color: theme.colors.text, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(r.value).toLocaleString()}{unit}
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", right: base * 0.06, bottom: base * 0.05, fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.14, color: "rgba(255,255,255,0.18)" }}>
        {steps[Math.round(stepF)].label}
      </div>
    </AbsoluteFill>
  );
};
