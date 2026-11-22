import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES_HD, countryName, requireCountry } from "../lib/geo";
import { clamp, useBase } from "../lib/useBase";

export const countryHighlightSchema = z.object({
  title: z.string(),
  items: z.array(z.object({ country: z.string(), label: z.string(), note: z.string() })).min(1),
  framesPerItem: z.number().int().min(10),
  zoomToData: z.boolean(),
});

const PALETTE = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D", "#FF6BD6", "#6BFF6B"];

// Countries light up one by one with a numbered list: "SAARC members", "countries that border X",
// "where my viewers are"… The camera can zoom to the highlighted group.
export const CountryHighlight: React.FC<z.infer<typeof countryHighlightSchema>> = ({ title, items, framesPerItem, zoomToData }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const feats = useMemo(() => items.map((it) => requireCountry(it.country, true)), [items]);
  const box: [[number, number], [number, number]] = portrait ? [[base * 0.05, h * 0.14], [w - base * 0.05, h * 0.58]] : [[w * 0.03, h * 0.14], [w * 0.64, h * 0.95]];
  const proj = useMemo(() => {
    const target = zoomToData ? { type: "FeatureCollection" as const, features: feats } : { type: "FeatureCollection" as const, features: COUNTRIES_HD };
    return geoNaturalEarth1().fitExtent(box, target);
  }, [feats, zoomToData, w, h]);
  const intro = interpolate(frame, [0, 30], [0.75, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const mid: [number, number] = [(box[0][0] + box[1][0]) / 2, (box[0][1] + box[1][1]) / 2];
  const zp = geoNaturalEarth1().scale(proj.scale() * intro).translate([mid[0] + (proj.translate()[0] - mid[0]) * intro, mid[1] + (proj.translate()[1] - mid[1]) * intro]).clipExtent([[-10, -10], [w + 10, h + 10]]);
  const path = geoPath(zp);
  const at = (i: number) => 25 + i * framesPerItem;
  const wanted = new Set(items.map((it) => countryName(it.country).toLowerCase()));

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #0F1630, #0A0E1C)", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {COUNTRIES_HD.map((c, i) => {
          if (wanted.has(c.properties.name.toLowerCase())) return null;
          const d = path(c);
          return d ? <path key={i} d={d} fill="#1C2647" stroke="#2A3866" strokeWidth={0.8} /> : null;
        })}
        {feats.map((f, i) => {
          const p = spring({ frame: frame - at(i), fps, config: { damping: 14 } });
          const col = PALETTE[i % PALETTE.length];
          const d = path(f) ?? "";
          const [cx, cy] = zp(geoCentroid(f)) ?? [0, 0];
          return (
            <g key={i}>
              <path d={d} fill={frame >= at(i) ? col : "#1C2647"} fillOpacity={frame >= at(i) ? 0.35 + 0.55 * p : 1} stroke={frame >= at(i) ? col : "#2A3866"} strokeWidth={frame >= at(i) ? base * 0.003 : 0.8} style={{ filter: frame >= at(i) ? `drop-shadow(0 0 ${base * 0.01 * p}px ${col})` : undefined }} />
              {frame >= at(i) && (
                <g transform={`translate(${cx} ${cy}) scale(${p})`}>
                  <circle r={base * 0.022} fill={col} stroke="#0A0E1C" strokeWidth={base * 0.004} />
                  <text y={base * 0.008} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={900} fontSize={base * 0.024} fill="#0A0E1C">{i + 1}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.05, right: base * 0.05, fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color: "#fff", textAlign: portrait ? "center" : "left", opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>{title}</div>
      <div style={{ position: "absolute", ...(portrait ? { left: base * 0.06, right: base * 0.06, top: h * 0.6 } : { left: w * 0.66, right: base * 0.04, top: h * 0.16 }), display: "grid", gridTemplateColumns: portrait ? "1fr 1fr" : "1fr", gap: base * 0.012 }}>
        {items.map((it, i) => {
          const p = spring({ frame: frame - at(i), fps, config: { damping: 16 } });
          const col = PALETTE[i % PALETTE.length];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.015, opacity: frame >= at(i) ? p : 0.25, transform: `translateX(${(1 - p) * base * 0.06}px)` }}>
              <div style={{ width: base * 0.045, height: base * 0.045, borderRadius: "50%", background: frame >= at(i) ? col : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.024, color: "#0A0E1C", flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.034, color: "#fff", lineHeight: 1.1 }}>{it.label}</div>
                {it.note && <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.022, color: theme.colors.muted }}>{it.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
