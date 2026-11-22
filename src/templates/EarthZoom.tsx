import { geoGraticule10, geoMercator, geoOrthographic, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, COUNTRIES_HD, countryByName } from "../lib/geo";
import { countryOf, formatLatLon, placeSchema, resolvePlace } from "../lib/places";
import { clamp, useBase } from "../lib/useBase";

export const earthZoomSchema = z.object({
  target: placeSchema,
  // Breadcrumb for the 5 zoom levels: Earth › country › region › village/area › exact spot.
  labels: z.array(z.string()).length(5),
  seed: z.string(),
});

const R_EARTH = 6_371_000; // metres
const GRATICULE = geoGraticule10();
// Frames where each level is reached (breadcrumb + zoom keyframes).
const KF = [0, 55, 100, 170, 230, 290, 330];

type Rect = { x: number; y: number; w: number; h: number; r: number; c: string };
type Circle = { x: number; y: number; r: number; c: string };

const ROOFS = ["#9AA5B1", "#8C97A3", "#B5652E", "#A0522D", "#6E7F8D", "#C0C6CC"];
const FIELDS = ["#A9C97A", "#B8D18A", "#9CC06B", "#C9D98E", "#8FB95E", "#D3D99A"];

// Procedural, deterministic landscape (metres, target at 0,0). Purely illustrative — not real imagery.
const buildWorld = (seed: string) => {
  const r = (k: string) => random(`${seed}-${k}`);
  // A big river meanders ~2–4 km south of home; a road passes ~1 km north.
  const riverY = (x: number) => 2900 + 1500 * Math.sin(x / 6500 + r("rv") * 6) + 500 * Math.sin(x / 1700);
  const river: string[] = [];
  for (let x = -45000; x <= 45000; x += 300) river.push(`${river.length ? "L" : "M"}${x} ${riverY(x)}`);
  const roadY = (x: number) => -1100 + x * 0.12 + 450 * Math.sin(x / 4200);
  const road: string[] = [];
  for (let x = -45000; x <= 45000; x += 400) road.push(`${road.length ? "L" : "M"}${x} ${roadY(x)}`);

  // Irregular paddy blocks: jittered sizes and colours on a 700 m grid.
  const fields: Rect[] = [];
  for (let gx = -50; gx < 50; gx++) for (let gy = -50; gy < 50; gy++) {
    const k = `${gx}_${gy}`;
    const sw = 520 + r(`fw${k}`) * 170;
    const sh = 520 + r(`fh${k}`) * 170;
    fields.push({ x: gx * 700 + (700 - sw) / 2, y: gy * 700 + (700 - sh) / 2, w: sw, h: sh, r: (r(`fr${k}`) - 0.5) * 6, c: FIELDS[Math.floor(r(`f${k}`) * FIELDS.length)] });
  }
  // Villages = blobs of trees and roofs, denser near home.
  const clusters: Circle[] = [];
  for (let i = 0; i < 260; i++) {
    const a = r(`ca${i}`) * Math.PI * 2;
    const d = 1400 + Math.pow(r(`cd${i}`), 0.8) * 32000;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (Math.abs(y - riverY(x)) < 600) continue;
    const big = 180 + r(`cr${i}`) * 380;
    for (let b = 0; b < 4; b++) clusters.push({ x: x + (r(`bx${i}${b}`) - 0.5) * big * 1.4, y: y + (r(`by${i}${b}`) - 0.5) * big, r: big * (0.55 + r(`bs${i}${b}`) * 0.4), c: b % 2 ? "#5F8A45" : "#6E9150" });
  }
  for (let b = 0; b < 7; b++) clusters.push({ x: (r(`hx${b}`) - 0.5) * 520, y: (r(`hy${b}`) - 0.5) * 380, r: 220 + r(`hr${b}`) * 140, c: b % 2 ? "#5F8A45" : "#6A9A4C" });

  // Village scale (within ~600 m of home).
  const paddies: Rect[] = [];
  for (let gx = -12; gx < 12; gx++) for (let gy = -12; gy < 12; gy++) {
    const cx = gx * 90 + 45;
    const cy = gy * 90 + 45;
    if (Math.hypot(cx, cy) < 330) continue;
    paddies.push({ x: gx * 90 + 3, y: gy * 90 + 3, w: 84, h: 84, r: 0, c: FIELDS[Math.floor(r(`p${gx}_${gy}`) * FIELDS.length)] });
  }
  const houses: Rect[] = [];
  for (let i = 0; i < 70 && houses.length < 46; i++) {
    const a = r(`ha${i}`) * Math.PI * 2;
    const d = 28 + r(`hd${i}`) * 290;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (Math.hypot(x - 45, y + 55) < 40) continue; // pond
    if (houses.some((hh) => Math.hypot(hh.x - x, hh.y - y) < 22)) continue;
    houses.push({ x, y, w: 9 + r(`hw${i}`) * 6, h: 6 + r(`hh${i}`) * 3.5, r: (r(`hr${i}`) - 0.5) * 50, c: ROOFS[Math.floor(r(`hc${i}`) * ROOFS.length)] });
  }
  const trees: Circle[] = [];
  for (let i = 0; i < 420 && trees.length < 260; i++) {
    const a = r(`ta${i}`) * Math.PI * 2;
    const d = 12 + Math.sqrt(r(`td${i}`)) * 330;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (Math.hypot(x - 45, y + 55) < 34 || Math.abs(x) < 22 && Math.abs(y) < 18) continue;
    if (houses.some((hh) => Math.hypot(hh.x - x, hh.y - y) < 11)) continue;
    trees.push({ x, y, r: 3 + r(`tr${i}`) * 4.5, c: r(`tc${i}`) > 0.5 ? "#3E7A35" : "#2F6B2D" });
  }
  // Irregular village boundary (a wobbly circle) instead of a perfect one.
  const edge: string[] = [];
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    const rr = 335 + 28 * Math.sin(a * 3 + r("e1") * 6) + 18 * Math.sin(a * 7 + r("e2") * 6);
    edge.push(`${k ? "L" : "M"}${Math.cos(a) * rr} ${Math.sin(a) * rr}`);
  }
  return { river: river.join(" "), road: road.join(" "), fields, clusters, paddies, houses, trees, villageEdge: `${edge.join(" ")} Z` };
};

const House: React.FC<{ h: Rect; accent?: string }> = ({ h, accent }) => (
  <g transform={`translate(${h.x} ${h.y}) rotate(${h.r})`}>
    <rect x={-h.w / 2 + 0.6} y={-h.h / 2 + 0.8} width={h.w} height={h.h} fill="rgba(0,0,0,0.25)" />
    <rect x={-h.w / 2} y={-h.h / 2} width={h.w} height={h.h / 2} fill={accent ?? h.c} />
    <rect x={-h.w / 2} y={0} width={h.w} height={h.h / 2} fill={accent ?? h.c} style={{ filter: "brightness(0.78)" }} />
    <line x1={-h.w / 2} y1={0} x2={h.w / 2} y2={0} stroke="rgba(255,255,255,0.5)" strokeWidth={0.25} />
  </g>
);

// "Google-Earth style" dive: space → globe spins to the place → country map → region → village → the house.
// Zoom is one continuous camera (pixels-per-metre), with soft cross-fades between detail levels.
export const EarthZoom: React.FC<z.infer<typeof earthZoomSchema>> = ({ target: targetIn, labels, seed }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const target = resolvePlace(targetIn);
  const world = useMemo(() => buildWorld(seed), [seed]);
  const country = countryByName(countryOf(target));
  const countryHD = country ? countryByName(country.properties.name, true) : undefined;

  // ── one continuous camera: log(pixels per metre) through the keyframes, eased per segment ──
  const ppmKeys = [base * 0.33 / R_EARTH, base * 0.33 / R_EARTH, base * 3 / R_EARTH, w / 60000, w / 3000, w / 320, w / 38];
  let seg = KF.length - 2;
  for (let i = 0; i < KF.length - 1; i++) if (frame < KF[i + 1]) { seg = i; break; }
  const t = interpolate(frame, [KF[seg], KF[seg + 1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ppm = Math.exp(Math.log(ppmKeys[seg]) + (Math.log(ppmKeys[seg + 1]) - Math.log(ppmKeys[seg])) * t);
  const altitude = (w / ppm) / 1.155; // metres, for a 60° field of view
  // Breadcrumb level: Earth, then each label lights up as its zoom level is reached.
  const level = [0, 96, 166, 226, 286].filter((f) => frame >= f).length - 1;

  const fade = (a: number, b: number, c?: number, d?: number) =>
    c === undefined ? interpolate(frame, [a, b], [0, 1], clamp) : interpolate(frame, [a, b, c, d!], [0, 1, 1, 0], clamp);
  const globeO = 1 - fade(92, 104);
  const mapO = fade(92, 104, 166, 178);
  const areaO = fade(166, 178, 226, 238);
  const villageO = fade(226, 238);

  // ── globe ──
  const spin = interpolate(frame, [0, 60], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const R = ppm * R_EARTH;
  const globe = geoOrthographic().rotate([-target.lon + 120 * (1 - spin), -target.lat * spin + 12 * (1 - spin)]).scale(R).translate([w / 2, h / 2]).clipExtent([[-10, -10], [w + 10, h + 10]]);
  const gPath = geoPath(globe);
  // ── flat map ──
  const merc = geoMercator().center([target.lon, target.lat]).scale(R).translate([w / 2, h / 2]).clipExtent([[-10, -10], [w + 10, h + 10]]);
  const mPath = geoPath(merc);

  // View half-extent in metres (for culling procedural layers).
  const vx = w / 2 / ppm + 50;
  const vy = h / 2 / ppm + 50;
  const inView = (x: number, y: number, pad: number) => Math.abs(x) < vx + pad && Math.abs(y) < vy + pad;
  const metres = `translate(${w / 2} ${h / 2}) scale(${ppm})`;

  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => [random(`s${i}`) * w, random(`t${i}`) * h, random(`u${i}`)]), [w, h]);
  const pinDrop = spring({ frame: frame - 294, fps, config: { damping: 10 } });
  const home: Rect = { x: 0, y: 0, w: 14, h: 9, r: 8, c: "#E4572E" };

  return (
    <AbsoluteFill style={{ background: "#03050C", overflow: "hidden" }}>
      {/* ── space + globe ── */}
      {globeO > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", opacity: globeO }}>
          {stars.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={base * 0.0016 * (1 + s * 2)} fill="#fff" opacity={0.25 + s * 0.6} />)}
          <circle cx={w / 2} cy={h / 2} r={R * 1.05} fill="#4DA3FF" opacity={0.18} />
          <path d={gPath({ type: "Sphere" }) ?? ""} fill="#0D3B66" />
          <path d={gPath(GRATICULE) ?? ""} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          {COUNTRIES.map((c, i) => <path key={i} d={gPath(c) ?? ""} fill={c === country ? "#7CB342" : "#4F7F3A"} stroke="rgba(255,255,255,0.2)" strokeWidth={0.6} />)}
        </svg>
      )}

      {/* ── country map ── */}
      {mapO > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", opacity: mapO }}>
          <rect width={w} height={h} fill="#1D4E7A" />
          {(R > w * 1.2 ? COUNTRIES_HD : COUNTRIES).map((c, i) => {
            const d = mPath(c);
            if (!d) return null;
            const isTarget = c === countryHD || c === country;
            return <path key={i} d={d} fill={isTarget ? "#79A94A" : "#557F3C"} stroke={isTarget ? theme.colors.accent : "rgba(255,255,255,0.3)"} strokeWidth={isTarget ? base * 0.004 : 1} />;
          })}
          <circle cx={w / 2} cy={h / 2} r={base * 0.012} fill={theme.colors.primary} stroke="#fff" strokeWidth={base * 0.003} />
          <circle cx={w / 2} cy={h / 2} r={base * (0.012 + ((frame % 30) / 30) * 0.03)} fill="none" stroke={theme.colors.primary} strokeWidth={base * 0.003} opacity={1 - (frame % 30) / 30} />
        </svg>
      )}

      {/* ── region (procedural) ── */}
      {areaO > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", opacity: areaO }}>
          <rect width={w} height={h} fill="#A7C47A" />
          <g transform={metres}>
            {world.fields.map((f, i) => (inView(f.x + 350, f.y + 350, 700) ? <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill={f.c} transform={`rotate(${f.r} ${f.x + f.w / 2} ${f.y + f.h / 2})`} /> : null))}
            <path d={world.river} fill="none" stroke="#C9B98F" strokeWidth={620} strokeLinecap="round" />
            <path d={world.river} fill="none" stroke="#4F8FC8" strokeWidth={480} strokeLinecap="round" />
            <path d={world.river} fill="none" stroke="#6FA8DC" strokeWidth={200} strokeLinecap="round" opacity={0.7} />
            {world.clusters.map((c, i) => (inView(c.x, c.y, c.r) ? <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.c} /> : null))}
            <path d={world.road} fill="none" stroke="#8E8676" strokeWidth={60} />
            <path d={world.road} fill="none" stroke="#E9E2D0" strokeWidth={38} />
          </g>
        </svg>
      )}

      {/* ── village + home (procedural) ── */}
      {villageO > 0 && (
        <svg width={w} height={h} style={{ position: "absolute", opacity: villageO }}>
          <rect width={w} height={h} fill="#8DBF63" />
          <g transform={metres}>
            {world.paddies.map((p, i) => (inView(p.x + 42, p.y + 42, 90) ? <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} stroke="#7A9A4E" strokeWidth={1.2} /> : null))}
            {world.villageEdge && <path d={world.villageEdge} fill="#79AD52" />}
            <path d="M-340 60 C -200 20, -90 40, -20 14 S 120 -30, 340 -90" fill="none" stroke="#D8C49A" strokeWidth={4} />
            <path d="M-12 14 C -30 80, 10 160, -40 340" fill="none" stroke="#D8C49A" strokeWidth={3} />
            <ellipse cx={45} cy={-55} rx={30} ry={20} fill="#3F7FB0" stroke="#5B8C3E" strokeWidth={3} />
            <ellipse cx={42} cy={-58} rx={18} ry={9} fill="#5E9BCB" />
            {/* home yard, wall, tube-well, garden */}
            <rect x={-17} y={-13} width={34} height={27} fill="#D9C59B" stroke="#B9A57C" strokeWidth={0.8} transform="rotate(8)" />
            <g transform="rotate(8)">
              {[0, 1, 2, 3].map((k) => <rect key={k} x={-15 + k * 3} y={7} width={1.6} height={5} fill="#5B8C3E" />)}
              {/* tube-well: pipe + handle */}
              <rect x={10.6} y={7} width={0.8} height={2.2} rx={0.3} fill="#4A5568" />
              <rect x={11} y={7.2} width={2.2} height={0.35} rx={0.15} fill="#4A5568" />
              <circle cx={11} cy={9.6} r={0.7} fill="#5E9BCB" opacity={0.8} />
            </g>
            {world.houses.map((hh, i) => (inView(hh.x, hh.y, 20) ? <House key={i} h={hh} /> : null))}
            <House h={home} />
            {world.trees.map((tr, i) => (inView(tr.x, tr.y, 10) ? (
              <g key={i}>
                <circle cx={tr.x + 0.8} cy={tr.y + 1} r={tr.r} fill="rgba(0,0,0,0.2)" />
                <circle cx={tr.x} cy={tr.y} r={tr.r} fill={tr.c} />
                <circle cx={tr.x - tr.r * 0.3} cy={tr.y - tr.r * 0.3} r={tr.r * 0.45} fill="#5C9E46" />
              </g>
            ) : null))}
            <circle cx={-12} cy={-10} r={5.5} fill="#2F6B2D" />
            <circle cx={-13.5} cy={-11.5} r={2.4} fill="#5C9E46" />
            {frame > 236 && frame < 288 && <circle cx={0} cy={0} r={13 + ((frame % 40) / 40) * 10} fill="none" stroke={theme.colors.accent} strokeWidth={1.4} opacity={(1 - (frame % 40) / 40) * interpolate(frame, [270, 288], [1, 0], clamp)} />}
          </g>
        </svg>
      )}

      {/* clouds while descending through the atmosphere */}
      {frame > 84 && frame < 130 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const p = interpolate(frame, [86 + i * 4, 122 + i * 2], [0, 1], clamp);
            const s = 0.6 + p * 3;
            return <div key={i} style={{ position: "absolute", left: w * (0.2 + random(`cl${i}`) * 0.6) - base * 0.4, top: h * (0.2 + random(`cm${i}`) * 0.6) - base * 0.15, width: base * 0.8, height: base * 0.3, borderRadius: "50%", background: "rgba(255,255,255,0.85)", filter: `blur(${base * 0.05}px)`, transform: `scale(${s})`, opacity: Math.sin(p * Math.PI) * 0.9 }} />;
          })}
        </AbsoluteFill>
      )}

      {/* final pin + label */}
      {frame >= 294 && (
        <div style={{ position: "absolute", left: w / 2, top: h / 2, transform: `translate(-50%, -100%) translateY(${(1 - pinDrop) * -base * 0.3}px)`, opacity: Math.min(1, pinDrop * 2), display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "#fff", borderRadius: base * 0.02, padding: `${base * 0.012}px ${base * 0.03}px`, fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.045, color: "#1B1F2A", boxShadow: "0 8px 24px rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{labels[4]}</div>
          <svg width={base * 0.07} height={base * 0.1} viewBox="-12 -32 24 34">
            <path d="M0 0 C -5 -9 -10 -13 -10 -20 A 10 10 0 1 1 10 -20 C 10 -13 5 -9 0 0 Z" fill={theme.colors.primary} stroke="#fff" strokeWidth={1.6} />
            <circle cx={0} cy={-20} r={4} fill="#fff" />
          </svg>
        </div>
      )}

      {/* HUD: breadcrumb, altitude, coordinates */}
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.04, right: base * 0.04, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: base * 0.012 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.012, opacity: i <= level ? 1 : 0.25 }}>
            {i > 0 && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: base * 0.03 }}>›</span>}
            <span style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.032, color: i === level ? "#1B1F2A" : "#fff", background: i === level ? theme.colors.accent : "rgba(0,0,0,0.45)", padding: `${base * 0.006}px ${base * 0.018}px`, borderRadius: 999 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: base * 0.04, bottom: base * 0.04, fontFamily: theme.fonts.mono, fontSize: base * 0.028, color: "#fff", background: "rgba(0,0,0,0.45)", padding: `${base * 0.008}px ${base * 0.02}px`, borderRadius: base * 0.012 }}>
        ALT {altitude >= 10000 ? `${Math.round(altitude / 1000).toLocaleString("en-US")} km` : altitude >= 1000 ? `${(altitude / 1000).toFixed(1)} km` : `${Math.round(altitude)} m`}
      </div>
      <div style={{ position: "absolute", right: base * 0.04, bottom: base * 0.04, fontFamily: theme.fonts.mono, fontSize: base * 0.024, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.45)", padding: `${base * 0.008}px ${base * 0.02}px`, borderRadius: base * 0.012 }}>
        {formatLatLon(target)}
      </div>
      <div style={{ position: "absolute", right: base * 0.04, bottom: base * 0.1, fontFamily: theme.fonts.body, fontSize: base * 0.018, color: "rgba(255,255,255,0.5)", opacity: frame > 170 ? 1 : 0 }}>Illustration — not real satellite imagery</div>
    </AbsoluteFill>
  );
};
