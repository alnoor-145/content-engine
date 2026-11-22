import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { geoDistance, geoInterpolate, geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Cursor } from "../components/Cursor";
import { COUNTRIES, COUNTRIES_HD, EARTH_KM } from "../lib/geo";
import { countryOf, distanceKm, placeSchema, resolvePlace, type Place } from "../lib/places";
import { graphemes } from "../lib/text";
import { clamp, useBase } from "../lib/useBase";

export const mapSearchSchema = z.object({
  from: placeSchema,
  to: placeSchema,
  mode: z.enum(["car", "bus", "walk", "plane"]),
  searchPlaceholder: z.string(),
});

const SPEED_KMH = { car: 45, bus: 35, walk: 5, plane: 800 };
const ICON = { car: "🚗", bus: "🚌", walk: "🚶", plane: "✈️" };
const MODES = ["car", "bus", "walk", "plane"] as const;

// Timeline (frames).
const T = { typeFrom: [18, 52], sugFrom: [48, 70], pickFrom: 62, fly: [68, 106], morph: 104, typeTo: [116, 150], sugTo: [146, 168], pickTo: 158, fit: [164, 204], route: [206, 266], info: 258 };

const WATER = "#A9D3EC";
const LAND = "#F4F1EA";
const BORDER = "#C9BFB0";

type Cam = { center: [number, number]; scale: number };

const fly = (a: Cam, b: Cam, t: number): Cam => {
  const center = geoInterpolate(a.center, b.center)(t) as [number, number];
  const far = Math.min(1, geoDistance(a.center, b.center) / 0.25);
  const ls = Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * t - 0.8 * far * Math.sin(Math.PI * t);
  return { center, scale: Math.exp(ls) };
};

const fmtTime = (h: number) => {
  const m = Math.round(h * 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};
const fmtKm = (km: number) => (km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString("en-US"));

const Pin: React.FC<{ x: number; y: number; color: string; size: number; drop: number }> = ({ x, y, color, size, drop }) => (
  <g transform={`translate(${x} ${y - (1 - drop) * size * 3}) scale(${size / 20})`} opacity={Math.min(1, drop * 2)}>
    <ellipse cx={0} cy={0} rx={5} ry={2} fill="rgba(0,0,0,0.25)" transform={`translate(0 ${(1 - drop) * 60})`} />
    <path d="M0 0 C -5 -9 -10 -13 -10 -20 A 10 10 0 1 1 10 -20 C 10 -13 5 -9 0 0 Z" fill={color} stroke="#fff" strokeWidth={1.6} />
    <circle cx={0} cy={-20} r={4} fill="#fff" />
  </g>
);

// Maps-app style animation: type a place in the search box, pick it, the map flies there;
// type a destination, the map zooms out, the route draws with a moving vehicle and a time/distance card.
// Places can be given by name (Dhaka, London, ঢাকা…) or with exact lat/lon.
export const MapSearch: React.FC<z.infer<typeof mapSearchSchema>> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const from = resolvePlace(props.from);
  const to = resolvePlace(props.to);
  const { mode } = props;

  // ── layout ──
  const cw = Math.min(w * 0.9, base * 1.05);
  const cx = (w - cw) / 2;
  const cardTop = base * 0.05;
  const barH = base * 0.11;
  const rowH = base * 0.085;
  const dirH = base * 0.05 + rowH * 2 + base * 0.1;
  const fs = base * 0.04;
  const infoH = base * 0.26;

  // ── cameras ──
  const cams = useMemo(() => {
    const cam0: Cam = { center: [from.lon, 15], scale: (w / (2 * Math.PI)) * 1.05 };
    const cam1: Cam = { center: [from.lon, from.lat], scale: (w * EARTH_KM) / 350 };
    const pad = base * 0.08;
    const extent: [[number, number], [number, number]] = [[pad, cardTop + dirH + base * 0.08], [w - pad, h - infoH - base * 0.1]];
    const fit = geoMercator().fitExtent(extent, { type: "MultiPoint", coordinates: [[from.lon, from.lat], [to.lon, to.lat]] });
    const maxScale = (w * EARTH_KM) / 15;
    // Whatever the fitted projection shows at the screen centre becomes our camera centre,
    // so both points land inside the free area between the top card and the bottom card.
    const c = fit.invert ? (fit.invert([w / 2, h / 2]) as [number, number]) : ([from.lon, from.lat] as [number, number]);
    const cam2: Cam = fit.scale() > maxScale ? { center: geoInterpolate([from.lon, from.lat], [to.lon, to.lat])(0.5) as [number, number], scale: maxScale } : { center: c, scale: fit.scale() };
    return { cam0, cam1, cam2 };
  }, [from.lon, from.lat, to.lon, to.lat, w, h, base, cardTop, dirH, infoH]);

  const ease = (f: number, [a, b]: number[]) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  let cam = cams.cam0;
  if (frame >= T.fly[0] && frame < T.fit[0]) cam = fly(cams.cam0, cams.cam1, ease(frame, T.fly));
  if (frame >= T.fit[0]) cam = fly(cams.cam1, cams.cam2, ease(frame, T.fit));

  const projection = geoMercator().center(cam.center).scale(cam.scale).translate([w / 2, h / 2]).clipExtent([[-20, -20], [w + 20, h + 20]]);
  const path = geoPath(projection);
  const countries = cam.scale > w * 1.2 ? COUNTRIES_HD : COUNTRIES;
  const pFrom = projection([from.lon, from.lat]) ?? [w / 2, h / 2];
  const pTo = projection([to.lon, to.lat]) ?? [w / 2, h / 2];

  // ── route (only once the camera has settled on cam2) ──
  const route = useMemo(() => {
    const p2 = geoMercator().center(cams.cam2.center).scale(cams.cam2.scale).translate([w / 2, h / 2]);
    const d = geoPath(p2)({ type: "LineString", coordinates: [[from.lon, from.lat], [to.lon, to.lat]] }) ?? "";
    return { d, len: d ? getLength(d) : 0 };
  }, [cams.cam2, from.lon, from.lat, to.lon, to.lat, w, h]);
  const routeP = ease(frame, T.route);
  const showRoute = frame >= T.fit[1] && route.len > 0;
  const head = showRoute ? getPointAtLength(route.d, route.len * routeP) : null;
  const ahead = showRoute ? getPointAtLength(route.d, Math.min(route.len, route.len * routeP + 2)) : null;
  const heading = head && ahead ? (Math.atan2(ahead.y - head.y, ahead.x - head.x) * 180) / Math.PI : 0;

  const km = distanceKm(from, to);
  const hours = km / SPEED_KMH[mode];

  // ── typing ──
  const fromChars = graphemes(from.name);
  const toChars = graphemes(to.name);
  const nFrom = Math.floor(interpolate(frame, T.typeFrom, [0, fromChars.length], clamp));
  const nTo = Math.floor(interpolate(frame, T.typeTo, [0, toChars.length], clamp));
  const caretOn = Math.floor(frame / 12) % 2 === 0;
  const morph = spring({ frame: frame - T.morph, fps, config: { damping: 18 } });
  const cardH = barH + (dirH - barH) * morph;

  const sugFromTop = cardTop + barH + base * 0.015;
  const sugToTop = cardTop + dirH + base * 0.015;
  const sugRowH = base * 0.1;
  const info = spring({ frame: frame - T.info, fps, config: { damping: 15 } });

  const labelSize = (area: number) => Math.max(base * 0.018, Math.min(base * 0.034, Math.sqrt(area) * 0.07));

  const Suggestion: React.FC<{ top: number; place: Place; active: boolean; visible: number }> = ({ top, place, active, visible }) => (
    <div style={{ position: "absolute", left: cx, top, width: cw, borderRadius: base * 0.025, background: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.18)", overflow: "hidden", opacity: visible, transform: `translateY(${(1 - visible) * -base * 0.02}px)` }}>
      <div style={{ height: sugRowH, display: "flex", alignItems: "center", gap: base * 0.025, padding: `0 ${base * 0.03}px`, background: active ? "#EEF3FF" : "#fff" }}>
        <div style={{ fontSize: fs }}>📍</div>
        <div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: fs * 0.95, color: "#1B1F2A" }}>{place.name}</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: fs * 0.65, color: "#6B7280" }}>{countryOf(place)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: WATER, overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {countries.map((c, i) => (
          <path key={i} d={path(c) ?? ""} fill={LAND} stroke={BORDER} strokeWidth={Math.max(0.8, base * 0.0015)} />
        ))}
        {countries.map((c, i) => {
          const a = path.area(c);
          if (a < (base * 0.12) ** 2) return null;
          const [lx, ly] = path.centroid(c);
          if (!(lx > 0 && lx < w && ly > 0 && ly < h)) return null;
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" fontFamily={theme.fonts.body} fontWeight={600} fontSize={labelSize(a)} fill="#8C8578" letterSpacing={base * 0.002}>
              {c.properties.name.toUpperCase()}
            </text>
          );
        })}
        {showRoute && (
          <>
            <path d={route.d} fill="none" stroke="#fff" strokeWidth={base * 0.016} strokeLinecap="round" {...evolvePath(routeP, route.d)} />
            <path d={route.d} fill="none" stroke="#2F6BFF" strokeWidth={base * 0.009} strokeLinecap="round" {...evolvePath(routeP, route.d)} />
          </>
        )}
        {frame >= T.pickFrom && <Pin x={pFrom[0]} y={pFrom[1]} color="#22A06B" size={base * 0.05} drop={spring({ frame: frame - T.fly[1] + 6, fps, config: { damping: 10 } })} />}
        {frame >= T.pickTo && <Pin x={pTo[0]} y={pTo[1]} color="#E5484D" size={base * 0.05} drop={spring({ frame: frame - T.pickTo - 4, fps, config: { damping: 10 } })} />}
        {frame >= T.fly[1] - 4 && (
          <g opacity={interpolate(frame, [T.fly[1] - 4, T.fly[1] + 6], [0, 1], clamp)}>
            <text x={pFrom[0]} y={pFrom[1] + base * 0.045} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={700} fontSize={base * 0.032} fill="#1B1F2A" stroke="#fff" strokeWidth={base * 0.008} paintOrder="stroke">{from.name}</text>
          </g>
        )}
        {frame >= T.fit[1] && (
          <text x={pTo[0]} y={pTo[1] + base * 0.045} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={700} fontSize={base * 0.032} fill="#1B1F2A" stroke="#fff" strokeWidth={base * 0.008} paintOrder="stroke" opacity={interpolate(frame, [T.fit[1], T.fit[1] + 10], [0, 1], clamp)}>{to.name}</text>
        )}
      </svg>

      {head && routeP > 0 && routeP < 1 && (
        <div style={{ position: "absolute", left: head.x - base * 0.035, top: head.y - base * 0.035, width: base * 0.07, height: base * 0.07, borderRadius: "50%", background: "#fff", border: `${base * 0.005}px solid #2F6BFF`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", fontSize: base * 0.038 }}>
          <span style={{ display: "inline-block", transform: mode === "plane" ? `rotate(${heading + 45}deg)` : undefined }}>{ICON[mode]}</span>
        </div>
      )}

      {/* search / directions card */}
      <div style={{ position: "absolute", left: cx, top: cardTop, width: cw, height: cardH, borderRadius: base * 0.03, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden", fontFamily: theme.fonts.body, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
        {frame < T.morph + 4 ? (
          <div style={{ height: barH, display: "flex", alignItems: "center", gap: base * 0.025, padding: `0 ${base * 0.035}px`, fontSize: fs }}>
            <span>🔍</span>
            {nFrom === 0 ? (
              <span style={{ color: "#9AA0A6" }}>{props.searchPlaceholder}</span>
            ) : (
              <span style={{ color: "#1B1F2A", fontWeight: 600 }}>
                {fromChars.slice(0, nFrom).join("")}
                <span style={{ color: "#2F6BFF", opacity: frame < T.typeFrom[1] + 6 && caretOn ? 1 : 0 }}>|</span>
              </span>
            )}
          </div>
        ) : (
          <div style={{ padding: `${base * 0.025}px ${base * 0.035}px`, opacity: morph }}>
            <div style={{ height: rowH, display: "flex", alignItems: "center", gap: base * 0.025, fontSize: fs * 0.9, borderBottom: "1px solid #E5E7EB" }}>
              <span style={{ width: fs * 0.5, height: fs * 0.5, borderRadius: "50%", border: `${fs * 0.12}px solid #22A06B`, display: "inline-block" }} />
              <span style={{ color: "#1B1F2A", fontWeight: 600 }}>{from.name}</span>
            </div>
            <div style={{ height: rowH, display: "flex", alignItems: "center", gap: base * 0.025, fontSize: fs * 0.9 }}>
              <span style={{ fontSize: fs * 0.8 }}>📍</span>
              {nTo === 0 ? <span style={{ color: "#9AA0A6" }}>Choose destination</span> : (
                <span style={{ color: "#1B1F2A", fontWeight: 600 }}>
                  {toChars.slice(0, nTo).join("")}
                  <span style={{ color: "#2F6BFF", opacity: frame < T.typeTo[1] + 6 && caretOn ? 1 : 0 }}>|</span>
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: base * 0.02, marginTop: base * 0.01 }}>
              {MODES.map((m) => (
                <div key={m} style={{ padding: `${base * 0.008}px ${base * 0.025}px`, borderRadius: 999, fontSize: fs * 0.8, background: m === mode ? "#2F6BFF" : "#F1F3F4", boxShadow: m === mode ? "0 2px 8px rgba(47,107,255,0.4)" : "none" }}>{ICON[m]}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {frame >= T.sugFrom[0] && frame < T.sugFrom[1] && <Suggestion top={sugFromTop} place={from} active={frame >= T.pickFrom - 4} visible={interpolate(frame, [T.sugFrom[0], T.sugFrom[0] + 6, T.sugFrom[1] - 4, T.sugFrom[1]], [0, 1, 1, 0], clamp)} />}
      {frame >= T.sugTo[0] && frame < T.sugTo[1] && <Suggestion top={sugToTop} place={to} active={frame >= T.pickTo - 4} visible={interpolate(frame, [T.sugTo[0], T.sugTo[0] + 6, T.sugTo[1] - 4, T.sugTo[1]], [0, 1, 1, 0], clamp)} />}

      {/* result card */}
      {frame >= T.info && (
        <div style={{ position: "absolute", left: portrait ? base * 0.05 : base * 0.05, right: portrait ? base * 0.05 : undefined, bottom: base * 0.05, width: portrait ? undefined : base * 0.95, height: infoH, borderRadius: base * 0.03, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", padding: `${base * 0.03}px ${base * 0.04}px`, display: "flex", alignItems: "center", gap: base * 0.035, transform: `translateY(${(1 - info) * infoH * 1.5}px)` }}>
          <div style={{ fontSize: base * 0.09 }}>{ICON[mode]}</div>
          <div style={{ fontFamily: theme.fonts.body }}>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.06, color: "#2F6BFF" }}>≈ {fmtTime(hours)}</div>
            <div style={{ fontSize: base * 0.032, color: "#1B1F2A", fontWeight: 600 }}>{fmtKm(km)} km · straight-line distance</div>
            <div style={{ fontSize: base * 0.028, color: "#6B7280" }}>{from.name} → {to.name}</div>
          </div>
        </div>
      )}

      <Cursor
        frame={frame}
        size={base * 0.05}
        visibleFrom={36}
        clicks={[T.pickFrom, T.pickTo]}
        keys={[
          [36, w * 0.92, h * 0.95],
          [T.pickFrom - 6, cx + cw * 0.3, sugFromTop + sugRowH * 0.5],
          [T.fly[1], w * 0.78, h * 0.62],
          [T.pickTo - 6, cx + cw * 0.3, sugToTop + sugRowH * 0.5],
          [T.fit[1], w * 0.95, h * 1.05],
        ]}
      />
      <div style={{ position: "absolute", right: base * 0.015, bottom: base * 0.006, fontFamily: theme.fonts.body, fontSize: base * 0.016, color: "rgba(0,0,0,0.45)" }}>Map data: Natural Earth</div>
    </AbsoluteFill>
  );
};
