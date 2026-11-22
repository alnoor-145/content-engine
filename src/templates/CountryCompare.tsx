import { evolvePath } from "@remotion/paths";
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { areaKm2, requireCountry, type Country } from "../lib/geo";
import { clamp, useBase } from "../lib/useBase";

const sideSchema = z.object({
  name: z.string(),
  label: z.string(),
  // Millions of people.
  population: z.number().nonnegative(),
  // Official area in km². 0 = measure it from the map (approximate).
  area: z.number().nonnegative(),
});

export const countryCompareSchema = z.object({
  title: z.string(),
  a: sideSchema,
  b: sideSchema,
  source: z.string(),
});

const T = { draw: [15, 60], fill: [45, 70], overlay: [95, 135], back: [160, 190], stats: 175 };
const COL = [theme.colors.secondary, theme.colors.primary];

// Equal-area outline of a country, centred on itself, as an SVG path at scale 1.
const outline = (c: Country) => {
  const [lon, lat] = geoCentroid(c);
  const p = geoAzimuthalEqualArea().rotate([-lon, -lat]).scale(1).translate([0, 0]);
  const path = geoPath(p);
  return { d: path(c) ?? "", bounds: path.bounds(c) };
};

// True-size comparison of two countries (same scale, equal-area projection): outlines draw,
// one slides over the other, then area, population and density bars compare them.
export const CountryCompare: React.FC<z.infer<typeof countryCompareSchema>> = ({ title, a, b, source }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const sides = [a, b];
  const geo = useMemo(() => sides.map((s) => {
    const c = requireCountry(s.name, true);
    return { ...outline(c), area: s.area > 0 ? s.area : areaKm2(c) };
  }), [a.name, b.name, a.area, b.area]);

  // Two cells side by side; both countries share ONE scale so their sizes are truthful.
  const top = base * 0.2;
  const cellH = portrait ? h * 0.33 : h * 0.42;
  const cellW = w / 2;
  const dims = geo.map((g) => [g.bounds[1][0] - g.bounds[0][0], g.bounds[1][1] - g.bounds[0][1]]);
  const k = Math.min((cellW * 0.82) / Math.max(dims[0][0], dims[1][0]), (cellH * 0.82) / Math.max(dims[0][1], dims[1][1]));
  const centers = [[cellW * 0.5, top + cellH / 2], [cellW * 1.5, top + cellH / 2]];

  const ease = (r: number[]) => interpolate(frame, r, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const draw = ease(T.draw);
  const fill = ease(T.fill);
  const over = ease(T.overlay) - ease(T.back);
  const dx = (centers[0][0] - centers[1][0]) * over;

  const big = geo[0].area >= geo[1].area ? 0 : 1;
  const ratio = geo[big].area / geo[1 - big].area;
  const density = sides.map((s, i) => (s.population * 1e6) / geo[i].area);
  const rows = [
    { label: "Area", unit: "km²", values: geo.map((g) => g.area), decimals: 0 },
    { label: "Population", unit: "M", values: sides.map((s) => s.population), decimals: 1 },
    { label: "People per km²", unit: "", values: density, decimals: 0 },
  ];

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.05, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.065, color: "#fff", opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>{title}</div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {geo.map((g, i) => {
          const cx = centers[i][0] - k * (g.bounds[0][0] + g.bounds[1][0]) / 2 + (i === 1 ? dx : 0);
          const cy = centers[i][1] - k * (g.bounds[0][1] + g.bounds[1][1]) / 2;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${k})`}>
              <path d={g.d} fill={COL[i]} fillOpacity={(i === 1 && over > 0.05 ? 0.55 : 0.85) * fill} stroke={COL[i]} strokeWidth={(base * 0.004) / k} strokeLinejoin="round" {...evolvePath(draw, g.d)} />
            </g>
          );
        })}
        {sides.map((s, i) => (
          <text key={i} x={centers[i][0]} y={top + cellH + base * 0.02} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={800} fontSize={base * 0.045} fill={COL[i]} opacity={interpolate(frame, [30, 45], [0, 1], clamp) * (1 - over)}>
            {s.label}
          </text>
        ))}
      </svg>
      <div style={{ position: "absolute", top: top + cellH + base * 0.06, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.042, color: theme.colors.accent, opacity: interpolate(frame, [T.overlay[1], T.overlay[1] + 12, T.back[0], T.back[0] + 10], [0, 1, 1, 0], clamp) }}>
        {sides[big].label} is {ratio.toFixed(ratio < 10 ? 1 : 0)}× bigger than {sides[1 - big].label}
      </div>
      <div style={{ position: "absolute", left: base * 0.08, right: base * 0.08, top: top + cellH + base * 0.08, display: "flex", flexDirection: portrait ? "column" : "row", gap: portrait ? base * 0.02 : base * 0.05 }}>
        {rows.map((r, ri) => {
          const at = T.stats + ri * 12;
          const p = spring({ frame: frame - at, fps, config: { damping: 18 } });
          const max = Math.max(...r.values, 1e-9);
          return (
            <div key={ri} style={{ flex: 1, opacity: p, transform: `translateY(${(1 - p) * base * 0.03}px)` }}>
              <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.03, color: theme.colors.muted, marginBottom: base * 0.006 }}>{r.label}</div>
              {r.values.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.015, marginBottom: base * 0.006 }}>
                  <div style={{ height: base * 0.032, width: `${(v / max) * 62 * p}%`, minWidth: base * 0.01, background: COL[i], borderRadius: base * 0.008 }} />
                  <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.03, color: "#fff", whiteSpace: "nowrap" }}>
                    {(v * p).toLocaleString("en-US", { maximumFractionDigits: r.decimals, minimumFractionDigits: r.decimals })} {r.unit}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: base * 0.06, bottom: base * 0.025, fontFamily: theme.fonts.body, fontSize: base * 0.02, color: "rgba(255,255,255,0.4)" }}>{source}</div>
    </AbsoluteFill>
  );
};
