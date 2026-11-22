import { evolvePath } from "@remotion/paths";
import { geoBounds, geoCentroid, geoContains, geoGraticule10, geoMercator, geoOrthographic, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, COUNTRIES_HD, requireCountry } from "../lib/geo";
import { placeSchema, resolvePlace } from "../lib/places";
import { clamp, useBase } from "../lib/useBase";

export const countryProfileSchema = z.object({
  country: z.string(),
  title: z.string(),
  capital: placeSchema,
  stats: z.array(z.object({ icon: z.string(), label: z.string(), value: z.number(), unit: z.string(), decimals: z.number().int().min(0).max(2) })).max(6),
  source: z.string(),
});

const GRATICULE = geoGraticule10();
const T = { spin: [0, 70], zoomOut: [60, 100], mapIn: [70, 100], outline: [100, 150], fill: [130, 160], capital: 150, stats: 165 };

// Country analysis: a globe spins to the country, dives into a flat map where the country
// outline draws itself, the capital pin drops and animated stat cards count up.
export const CountryProfile: React.FC<z.infer<typeof countryProfileSchema>> = ({ country, title, capital, stats, source }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const target = requireCountry(country);
  const targetHD = requireCountry(country, true);
  const cap = resolvePlace(capital);
  const [clon, clat] = geoCentroid(target);
  const ease = (r: number[]) => interpolate(frame, r, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // ── globe ──
  const spin = ease(T.spin);
  const globeR = base * 0.36 * (1 + ease([70, 100]) * 3);
  const globe = geoOrthographic().rotate([-clon + 110 * (1 - spin), -clat * spin + 10 * (1 - spin)]).scale(globeR).translate([w / 2, h / 2]);
  const gPath = geoPath(globe);
  const globeOpacity = interpolate(frame, [85, 100], [1, 0], clamp);

  // ── flat map ──
  const mapBox: [[number, number], [number, number]] = portrait ? [[base * 0.08, h * 0.13], [w - base * 0.08, h * 0.52]] : [[base * 0.06, base * 0.2], [w * 0.58, h - base * 0.1]];
  const mapProj = useMemo(() => geoMercator().fitExtent(mapBox, targetHD), [targetHD, mapBox[0][0], mapBox[0][1], mapBox[1][0], mapBox[1][1]]);
  const mapIn = ease(T.mapIn);
  const zoomK = 0.55 + 0.45 * mapIn;
  // Zoom around the middle of the map box so the country stays centred while the scale changes.
  const mid: [number, number] = [(mapBox[0][0] + mapBox[1][0]) / 2, (mapBox[0][1] + mapBox[1][1]) / 2];
  const zoomProj = geoMercator().center(mapProj.invert ? (mapProj.invert(mid) as [number, number]) : [clon, clat]).scale(mapProj.scale() * zoomK).translate(mid).clipExtent([[-10, -10], [w + 10, h + 10]]);
  const zPath = geoPath(zoomProj);
  const targetD = zPath(targetHD) ?? "";
  const capXY = zoomProj([cap.lon, cap.lat]) ?? mid;
  const outline = ease(T.outline);
  const fill = ease(T.fill);
  const capDrop = spring({ frame: frame - T.capital, fps, config: { damping: 10 } });

  // Neighbour labels: sample a grid over the map box (final zoom), find which country each point is in,
  // and put each label at its most "interior" visible point — never on top of the target country.
  const labels = useMemo(() => {
    const final = geoMercator().center(mapProj.invert ? (mapProj.invert(mid) as [number, number]) : [clon, clat]).scale(mapProj.scale()).translate(mid);
    const bounds = COUNTRIES_HD.map((c) => geoBounds(c));
    const cols = 26;
    const rows = 18;
    const pts: { x: number; y: number; c: number }[] = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = mapBox[0][0] + ((i + 0.5) / cols) * (mapBox[1][0] - mapBox[0][0]);
      const y = mapBox[0][1] + ((j + 0.5) / rows) * (mapBox[1][1] - mapBox[0][1]);
      const ll = final.invert?.([x, y]);
      let c = -1;
      if (ll) for (let k = 0; k < COUNTRIES_HD.length; k++) {
        const [[x0, y0], [x1, y1]] = bounds[k];
        if (ll[1] < y0 || ll[1] > y1 || (x0 <= x1 ? ll[0] < x0 || ll[0] > x1 : ll[0] < x0 && ll[0] > x1)) continue;
        if (geoContains(COUNTRIES_HD[k], ll)) { c = k; break; }
      }
      pts.push({ x, y, c });
    }
    const out: { name: string; x: number; y: number }[] = [];
    COUNTRIES_HD.forEach((country, k) => {
      if (country === targetHD) return;
      const mine = pts.filter((p) => p.c === k);
      if (mine.length < 8) return;
      let best = mine[0];
      let bestD = -1;
      for (const p of mine) {
        let d = Math.min(p.x - mapBox[0][0], mapBox[1][0] - p.x, p.y - mapBox[0][1], mapBox[1][1] - p.y);
        for (const q of pts) if (q.c !== k) d = Math.min(d, Math.hypot(p.x - q.x, p.y - q.y));
        if (d > bestD) { bestD = d; best = p; }
      }
      out.push({ name: country.properties.name, x: best.x, y: best.y });
    });
    return out;
  }, [mapProj, targetHD, mid[0], mid[1], clon, clat]);

  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => [random(`x${i}`) * w, random(`y${i}`) * h, random(`r${i}`)]), [w, h]);

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0F1B33, #050811 75%)", overflow: "hidden" }}>
      {/* globe */}
      {globeOpacity > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", opacity: globeOpacity }}>
          {stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={base * 0.0015 * (1 + r * 2)} fill="#fff" opacity={0.3 + r * 0.5} />)}
          <circle cx={w / 2} cy={h / 2} r={globeR * 1.06} fill={theme.colors.secondary} opacity={0.12} />
          <path d={gPath({ type: "Sphere" }) ?? ""} fill="#0E3A5E" />
          <path d={gPath(GRATICULE) ?? ""} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          {COUNTRIES.map((c, i) => (
            <path key={i} d={gPath(c) ?? ""} fill={c === target ? theme.colors.accent : "#2E6E54"} stroke="rgba(255,255,255,0.25)" strokeWidth={0.6} />
          ))}
        </svg>
      )}

      {/* flat map */}
      <svg width={w} height={h} style={{ position: "absolute", opacity: mapIn }}>
        {COUNTRIES_HD.map((c, i) => {
          if (c === targetHD) return null;
          const d = zPath(c);
          if (!d) return null;
          return <path key={i} d={d} fill="#1A2540" stroke="#2C3A5C" strokeWidth={Math.max(0.8, base * 0.0012)} />;
        })}
        {labels.map((l, i) => (
          <text key={`l${i}`} x={mid[0] + (l.x - mid[0]) * zoomK} y={mid[1] + (l.y - mid[1]) * zoomK} textAnchor="middle" dominantBaseline="middle" fontFamily={theme.fonts.body} fontSize={base * 0.022} fill="rgba(255,255,255,0.4)" letterSpacing={base * 0.002}>
            {l.name.toUpperCase()}
          </text>
        ))}
        <path d={targetD} fill={theme.colors.accent} fillOpacity={0.85 * fill} stroke="none" />
        <path d={targetD} fill="none" stroke={theme.colors.accent} strokeWidth={base * 0.004} strokeLinejoin="round" {...evolvePath(outline, targetD)} style={{ filter: `drop-shadow(0 0 ${base * 0.01}px ${theme.colors.accent})` }} />
        {frame >= T.capital && (
          <g transform={`translate(${capXY[0]} ${capXY[1] - (1 - capDrop) * base * 0.15})`} opacity={Math.min(1, capDrop * 2)}>
            <circle r={base * 0.014} fill={theme.colors.primary} stroke="#fff" strokeWidth={base * 0.004} />
            <circle r={base * 0.014 * (1 + ((frame - T.capital) % 30) / 12)} fill="none" stroke={theme.colors.primary} strokeWidth={base * 0.003} opacity={1 - ((frame - T.capital) % 30) / 30} />
            <text x={base * 0.025} y={base * 0.01} fontFamily={theme.fonts.heading} fontWeight={800} fontSize={base * 0.034} fill="#fff" stroke="#050811" strokeWidth={base * 0.008} paintOrder="stroke">★ {cap.name}</text>
          </g>
        )}
      </svg>

      {/* title */}
      <div style={{ position: "absolute", left: base * 0.06, right: base * 0.06, top: base * 0.05, textAlign: portrait ? "center" : "left", opacity: interpolate(frame, [5, 20], [0, 1], clamp) }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.075, color: "#fff", lineHeight: 1.1 }}>{title}</div>
      </div>

      {/* stats */}
      <div
        style={{
          position: "absolute",
          ...(portrait ? { left: base * 0.06, right: base * 0.06, top: h * 0.56 } : { left: w * 0.62, right: base * 0.06, top: base * 0.2 }),
          display: "grid",
          gridTemplateColumns: portrait ? "1fr 1fr" : "1fr",
          gap: base * 0.022,
        }}
      >
        {stats.map((s, i) => {
          const at = T.stats + i * 12;
          const p = spring({ frame: frame - at, fps, config: { damping: 16 } });
          const v = s.value * interpolate(frame, [at, at + 35], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.02, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: base * 0.02, padding: `${base * 0.018}px ${base * 0.025}px`, opacity: p, transform: `translateX(${(1 - p) * base * 0.15}px)` }}>
              <div style={{ fontSize: base * 0.05 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.026, color: theme.colors.muted }}>{s.label}</div>
                <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.048, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                  {v.toLocaleString("en-US", { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals })}
                  <span style={{ fontSize: base * 0.03, color: theme.colors.accent }}> {s.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: base * 0.06, bottom: base * 0.025, fontFamily: theme.fonts.body, fontSize: base * 0.02, color: "rgba(255,255,255,0.4)", opacity: interpolate(frame, [T.stats, T.stats + 20], [0, 1], clamp) }}>{source}</div>
    </AbsoluteFill>
  );
};
