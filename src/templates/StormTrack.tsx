import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES_HD } from "../lib/geo";
import { clamp, useBase } from "../lib/useBase";

export const stormTrackSchema = z.object({
  name: z.string(),
  // Track points in order. wind = km/h.
  track: z.array(z.object({ lat: z.number(), lon: z.number(), wind: z.number().nonnegative(), label: z.string() })).min(2),
  landfallIndex: z.number().int().min(-1),
  // Map window [west, south, east, north] in degrees.
  bounds: z.array(z.number()).length(4),
  note: z.string(),
});

// Saffir-Simpson-like colour by wind speed (km/h).
const windColor = (v: number) => interpolateColors(v, [60, 118, 154, 178, 209, 252], ["#4DD4FF", "#4DFFB0", "#FFD84D", "#FF9F4D", "#FF4D6D", "#C04DFF"]);
const category = (v: number) => (v < 62 ? "Depression" : v < 89 ? "Cyclonic storm" : v < 118 ? "Severe cyclone" : v < 166 ? "Very severe cyclone" : v < 221 ? "Extremely severe" : "Super cyclone");

const Cyclone: React.FC<{ r: number; spin: number; color: string }> = ({ r, spin, color }) => (
  <g transform={`rotate(${spin})`}>
    <circle r={r * 1.25} fill={color} opacity={0.12} />
    {[0, 120, 240].map((a) => (
      <path key={a} transform={`rotate(${a})`} d={`M 0 ${-r * 0.18} C ${r * 0.55} ${-r * 0.35}, ${r * 0.95} ${r * 0.05}, ${r * 0.85} ${r * 0.62} C ${r * 0.65} ${r * 0.25}, ${r * 0.35} ${-r * 0.02}, 0 ${-r * 0.18} Z`} fill="rgba(240,248,255,0.85)" />
    ))}
    <circle r={r * 0.22} fill="rgba(240,248,255,0.95)" />
    <circle r={r * 0.08} fill="#2B3A55" />
  </g>
);

// Cyclone path animation: the storm spins along its track over a real map, the trail is coloured by
// wind speed, a forecast cone opens ahead, a live wind/category panel updates and landfall flashes.
// Default data is illustrative — use official track data (e.g. BMD / IMD advisories) for real reports.
export const StormTrack: React.FC<z.infer<typeof stormTrackSchema>> = ({ name, track, landfallIndex, bounds, note }) => {
  const frame = useCurrentFrame();
  const { width: w, height: h, durationInFrames } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const [west, south, east, north] = bounds;
  const proj = useMemo(
    // Fit the four corners (a MultiPoint avoids polygon winding issues on the sphere).
    () => geoMercator().fitExtent([[0, 0], [w, h]], { type: "MultiPoint", coordinates: [[west, south], [east, south], [east, north], [west, north]] }),
    [w, h, west, south, east, north],
  );
  const path = geoPath(proj.clipExtent([[-10, -10], [w + 10, h + 10]]));
  const pts = track.map((p) => proj([p.lon, p.lat]) ?? [0, 0]);

  const start = 20;
  const end = durationInFrames - 50;
  const prog = interpolate(frame, [start, end], [0, track.length - 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const i0 = Math.floor(prog);
  const i1 = Math.min(i0 + 1, track.length - 1);
  const f = prog - i0;
  const x = pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f;
  const y = pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f;
  const wind = track[i0].wind + (track[i1].wind - track[i0].wind) * f;
  const color = windColor(wind);
  const r = base * (0.05 + 0.08 * Math.min(1, wind / 220));
  const landfall = landfallIndex >= 0 && prog >= landfallIndex;
  const lfAge = landfallIndex >= 0 ? prog - landfallIndex : -1;

  // Forecast cone from the current position to the end of the track.
  const cone = (() => {
    const rest = [[x, y], ...pts.slice(i1)];
    if (rest.length < 2) return "";
    const left: string[] = [];
    const right: string[] = [];
    rest.forEach((p, k) => {
      const q = rest[Math.min(k + 1, rest.length - 1)];
      const pp = rest[Math.max(k - 1, 0)];
      const dx = q[0] - pp[0];
      const dy = q[1] - pp[1];
      const len = Math.hypot(dx, dy) || 1;
      const wdt = base * (0.02 + 0.03 * k);
      left.push(`${p[0] - (dy / len) * wdt} ${p[1] + (dx / len) * wdt}`);
      right.unshift(`${p[0] + (dy / len) * wdt} ${p[1] - (dx / len) * wdt}`);
    });
    return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
  })();

  return (
    <AbsoluteFill style={{ background: "#0A2342", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>
          <pattern id="storm-lat" width={w} height={base * 0.08} patternUnits="userSpaceOnUse">
            <line x1={0} y1={0} x2={w} y2={0} stroke="rgba(255,255,255,0.05)" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#storm-lat)" />
        {/* ocean swell */}
        {Array.from({ length: 30 }).map((_, k) => (
          <path key={k} d={`M ${random(`wx${k}`) * w} ${random(`wy${k}`) * h} q ${base * 0.02} ${-base * 0.008} ${base * 0.04} 0`} stroke="rgba(255,255,255,0.08)" strokeWidth={base * 0.002} fill="none" transform={`translate(${Math.sin(frame * 0.03 + k) * base * 0.01} 0)`} />
        ))}
        {COUNTRIES_HD.map((c, k) => <path key={k} d={path(c) ?? ""} fill="#2F5D3A" stroke="#4C8A5A" strokeWidth={Math.max(0.8, base * 0.0015)} />)}
        {COUNTRIES_HD.map((c, k) => {
          const a = path.area(c);
          if (a < (base * 0.1) ** 2) return null;
          const [lx, ly] = path.centroid(c);
          if (!(lx > 0 && lx < w && ly > 0 && ly < h)) return null;
          return <text key={`t${k}`} x={lx} y={ly} textAnchor="middle" fontFamily={theme.fonts.body} fontWeight={700} fontSize={base * 0.026} fill="rgba(255,255,255,0.35)" letterSpacing={base * 0.003}>{c.properties.name.toUpperCase()}</text>;
        })}
        {/* track: past (solid, coloured) */}
        {pts.slice(0, i0 + 1).map((p, k) => {
          const q = k === i0 ? [x, y] : pts[k + 1];
          return <line key={k} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={windColor(track[k].wind)} strokeWidth={base * 0.008} strokeLinecap="round" />;
        })}
        {/* forecast: dashed + cone */}
        {cone && <path d={cone} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeDasharray={`${base * 0.01} ${base * 0.008}`} />}
        {pts.slice(i1).map((p, k) => {
          const prev = k === 0 ? [x, y] : pts[i1 + k - 1];
          return <line key={`f${k}`} x1={prev[0]} y1={prev[1]} x2={p[0]} y2={p[1]} stroke="rgba(255,255,255,0.5)" strokeWidth={base * 0.004} strokeDasharray={`${base * 0.012} ${base * 0.01}`} />;
        })}
        {pts.map((p, k) => (
          <g key={`d${k}`}>
            <circle cx={p[0]} cy={p[1]} r={base * 0.008} fill={k <= i0 ? windColor(track[k].wind) : "rgba(255,255,255,0.6)"} stroke="#0A2342" strokeWidth={base * 0.002} />
            {track[k].label && <text x={p[0] + base * 0.015} y={p[1] + base * 0.006} fontFamily={theme.fonts.body} fontWeight={600} fontSize={base * 0.02} fill="rgba(255,255,255,0.7)">{track[k].label}</text>}
          </g>
        ))}
        {landfall && lfAge < 1.5 && (
          <circle cx={pts[landfallIndex][0]} cy={pts[landfallIndex][1]} r={base * (0.03 + lfAge * 0.25)} fill="none" stroke="#FF4D6D" strokeWidth={base * 0.006} opacity={1 - lfAge / 1.5} />
        )}
        <g transform={`translate(${x} ${y})`}>
          <Cyclone r={r} spin={-frame * 9} color={color} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.05, right: base * 0.05, display: "flex", flexDirection: portrait ? "column" : "row", justifyContent: "space-between", gap: base * 0.02 }}>
        <div>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.026, color: "#FF4D6D", letterSpacing: base * 0.004 }}>● CYCLONE TRACK</div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: "#fff" }}>{name}</div>
        </div>
        <div style={{ background: "rgba(5,12,25,0.8)", borderRadius: base * 0.02, padding: `${base * 0.015}px ${base * 0.03}px`, border: `2px solid ${color}`, minWidth: base * 0.38 }}>
          <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.024, color: theme.colors.muted }}>{track[i0].label || "Max wind"}</div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color, fontVariantNumeric: "tabular-nums" }}>{Math.round(wind)} km/h</div>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.026, color: "#fff" }}>{category(wind)}</div>
        </div>
      </div>
      {landfall && (
        <div style={{ position: "absolute", left: "50%", bottom: base * 0.12, transform: `translateX(-50%) scale(${interpolate(lfAge, [0, 0.3], [0.6, 1], clamp)})`, background: "#FF4D6D", color: "#fff", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.05, padding: `${base * 0.01}px ${base * 0.04}px`, borderRadius: 999, opacity: interpolate(lfAge, [0, 0.2], [0, 1], clamp) }}>
          LANDFALL
        </div>
      )}
      <div style={{ position: "absolute", left: base * 0.05, bottom: base * 0.03, fontFamily: theme.fonts.body, fontSize: base * 0.02, color: "rgba(255,255,255,0.55)" }}>{note}</div>
    </AbsoluteFill>
  );
};
