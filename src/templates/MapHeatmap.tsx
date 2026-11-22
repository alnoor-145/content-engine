import { geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, WORLD } from "../lib/geo";
import { clamp, useBase } from "../lib/useBase";

export const mapHeatmapSchema = z.object({
  title: z.string(),
  unit: z.string(),
  // Country name (as in Natural Earth, e.g. "Bangladesh", "United States of America") → value.
  values: z.record(z.string(), z.number()),
  zoomToData: z.boolean(),
});

// Choropleth world map: countries fill in from lowest to highest value, with a legend and top-3 list.
export const MapHeatmap: React.FC<z.infer<typeof mapHeatmapSchema>> = ({ title, unit, values, zoomToData }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const lookup = useMemo(() => Object.fromEntries(Object.entries(values).map(([k, v]) => [k.toLowerCase(), v])), [values]);
  const nums = Object.values(values);
  const max = Math.max(...nums, 1);
  const min = Math.min(...nums, 0);
  const ranked = Object.entries(values).sort((a, b) => a[1] - b[1]);

  const paths = useMemo(() => {
    const mapH = portrait ? height * 0.5 : height * 0.78;
    const top = portrait ? height * 0.18 : height * 0.16;
    const withData = COUNTRIES.filter((c) => lookup[c.properties.name.toLowerCase()] !== undefined);
    const target = zoomToData && withData.length ? { type: "FeatureCollection" as const, features: withData } : WORLD;
    const projection = geoNaturalEarth1().fitExtent([[base * 0.05, top], [width - base * 0.05, top + mapH]], target);
    const path = geoPath(projection);
    return COUNTRIES.map((c) => ({ d: path(c) ?? "", value: lookup[c.properties.name.toLowerCase()] as number | undefined, name: c.properties.name }));
  }, [lookup, zoomToData, width, height, base, portrait]);

  const fillOf = (name: string, v: number) => {
    const rank = ranked.findIndex(([k]) => k.toLowerCase() === name.toLowerCase());
    const t = interpolate(frame, [15 + rank * 4, 30 + rank * 4], [0, 1], clamp);
    const target = interpolateColors((v - min) / (max - min || 1), [0, 0.5, 1], ["#2B3A67", theme.colors.secondary, theme.colors.primary]);
    return interpolateColors(t, [0, 1], ["#1A2338", target]);
  };

  return (
    <AbsoluteFill style={{ background: theme.colors.background }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.value === undefined ? "#1A2338" : fillOf(p.name, p.value)} stroke="#0B0F1A" strokeWidth={Math.max(0.5, base * 0.001)} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: base * 0.05, left: base * 0.06, fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color: theme.colors.text }}>{title}</div>
      <div style={{ position: "absolute", left: base * 0.06, bottom: base * 0.06, display: "flex", flexDirection: "column", gap: base * 0.012, opacity: interpolate(frame, [40, 60], [0, 1], clamp) }}>
        {ranked.slice(-3).reverse().map(([name, v], i) => (
          <div key={name} style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.032, color: theme.colors.text }}>
            <span style={{ color: theme.colors.accent, fontWeight: 800 }}>#{i + 1}</span> {name} · {v.toLocaleString()}{unit}
          </div>
        ))}
        <div style={{ width: base * 0.4, height: base * 0.018, borderRadius: 99, background: `linear-gradient(90deg, #2B3A67, ${theme.colors.secondary}, ${theme.colors.primary})`, marginTop: base * 0.01 }} />
        <div style={{ display: "flex", justifyContent: "space-between", width: base * 0.4, fontFamily: theme.fonts.body, fontSize: base * 0.024, color: theme.colors.muted }}>
          <span>{min.toLocaleString()}{unit}</span>
          <span>{max.toLocaleString()}{unit}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
