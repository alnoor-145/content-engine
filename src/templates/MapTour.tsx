import { geoInterpolate, geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, COUNTRIES_HD } from "../lib/geo";
import { fly, Pin, scaleForKm, type Cam } from "../lib/mapui";
import { placeSchema, resolvePlace } from "../lib/places";
import { clamp, useBase } from "../lib/useBase";

export const mapTourSchema = z.object({
  title: z.string(),
  stops: z.array(z.object({ place: placeSchema, icon: z.string(), heading: z.string(), text: z.string() })).min(2),
  // Roughly how many kilometres fit across the screen at each stop.
  viewKm: z.number().positive(),
  vehicle: z.string(),
  flyFrames: z.number().int().min(20),
  holdFrames: z.number().int().min(30),
});

const INTRO = 30;

// Travel-vlog map tour: the camera flies from stop to stop on a real map, a vehicle follows the route,
// a pin drops at each place and an info card slides in. Works for history routes, trips, delivery stories…
export const MapTour: React.FC<z.infer<typeof mapTourSchema>> = ({ title, stops, viewKm, vehicle, flyFrames, holdFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const places = useMemo(() => stops.map((s) => resolvePlace(s.place)), [stops]);
  const seg = flyFrames + holdFrames;

  const cams: Cam[] = places.map((p) => ({ center: [p.lon, p.lat], scale: scaleForKm(w, viewKm) }));
  const world: Cam = { center: [places[0].lon, Math.max(-40, Math.min(50, places[0].lat))], scale: (w / (2 * Math.PI)) * 1.1 };

  // Which leg are we on? leg i = flying into stop i (i = 0 flies in from the world view).
  const tt = frame - INTRO;
  const leg = Math.max(0, Math.min(places.length - 1, Math.floor(tt / seg)));
  const inLeg = tt - leg * seg;
  const flyP = tt < 0 ? 0 : interpolate(inLeg, [0, flyFrames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const from = leg === 0 ? world : cams[leg - 1];
  const cam = tt < 0 ? world : fly(from, cams[leg], flyP);
  const arrived = tt >= 0 && inLeg >= flyFrames;

  const proj = geoMercator().center(cam.center).scale(cam.scale).translate([w / 2, h / 2]).clipExtent([[-20, -20], [w + 20, h + 20]]);
  const path = geoPath(proj);
  const countries = cam.scale > w * 1.2 ? COUNTRIES_HD : COUNTRIES;

  // Route so far: completed legs + the current leg up to the vehicle.
  const routeCoords: [number, number][] = [];
  for (let i = 1; i <= leg; i++) {
    const a: [number, number] = [places[i - 1].lon, places[i - 1].lat];
    const b: [number, number] = [places[i].lon, places[i].lat];
    const interp = geoInterpolate(a, b);
    const upto = i < leg ? 1 : flyP;
    for (let k = 0; k <= 24; k++) routeCoords.push(interp((k / 24) * upto) as [number, number]);
  }
  const routeD = routeCoords.length > 1 ? path({ type: "LineString", coordinates: routeCoords }) ?? "" : "";
  const head = routeCoords.length ? proj(routeCoords[routeCoords.length - 1]) : null;
  const prev = routeCoords.length > 1 ? proj(routeCoords[routeCoords.length - 2]) : null;
  const heading = head && prev ? (Math.atan2(head[1] - prev[1], head[0] - prev[0]) * 180) / Math.PI : 0;
  const moving = leg > 0 && !arrived;

  const card = spring({ frame: inLeg - flyFrames, fps, config: { damping: 15 } });
  const cardOut = interpolate(inLeg, [seg - 10, seg], [1, 0], clamp);
  const showCard = arrived && (leg === places.length - 1 || cardOut > 0);
  const stop = stops[leg];

  return (
    <AbsoluteFill style={{ background: "#071322", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>
          <pattern id="tour-grid" width={base * 0.06} height={base * 0.06} patternUnits="userSpaceOnUse">
            <path d={`M ${base * 0.06} 0 L 0 0 0 ${base * 0.06}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#tour-grid)" />
        {countries.map((c, i) => <path key={i} d={path(c) ?? ""} fill="#2A4D3E" stroke="#5E9A7C" strokeWidth={Math.max(0.8, base * 0.0015)} />)}
        {countries.map((c, i) => {
          const a = path.area(c);
          if (a < (base * 0.12) ** 2) return null;
          const [lx, ly] = path.centroid(c);
          if (!(lx > base * 0.05 && lx < w - base * 0.05 && ly > base * 0.15 && ly < h - base * 0.05)) return null;
          return <text key={`n${i}`} x={lx} y={ly} textAnchor="middle" fontFamily={theme.fonts.body} fontWeight={700} fontSize={base * 0.026} fill="rgba(255,255,255,0.28)" letterSpacing={base * 0.004}>{c.properties.name.toUpperCase()}</text>;
        })}
        {routeD && (
          <>
            <path d={routeD} fill="none" stroke={theme.colors.accent} strokeWidth={base * 0.012} strokeLinecap="round" opacity={0.25} />
            <path d={routeD} fill="none" stroke={theme.colors.accent} strokeWidth={base * 0.005} strokeLinecap="round" strokeDasharray={`${base * 0.02} ${base * 0.012}`} strokeDashoffset={-frame * base * 0.002} />
          </>
        )}
        {places.map((p, i) => {
          const visibleFrom = INTRO + i * seg + flyFrames - 4;
          if (frame < visibleFrom) return null;
          const xy = proj([p.lon, p.lat]);
          if (!xy) return null;
          const drop = spring({ frame: frame - visibleFrom, fps, config: { damping: 10 } });
          return <Pin key={i} x={xy[0]} y={xy[1]} color={i === leg ? theme.colors.primary : "#8FA3B8"} size={base * 0.05} drop={drop} label={p.name} font={theme.fonts.heading} />;
        })}
      </svg>
      {moving && head && (
        <div style={{ position: "absolute", left: head[0] - base * 0.04, top: head[1] - base * 0.04, width: base * 0.08, height: base * 0.08, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: base * 0.045, boxShadow: `0 0 ${base * 0.03}px ${theme.colors.accent}` }}>
          <span style={{ display: "inline-block", transform: vehicle === "✈️" ? `rotate(${heading + 45}deg)` : heading > 90 || heading < -90 ? "scaleX(-1)" : undefined }}>{vehicle}</span>
        </div>
      )}
      {/* title + progress dots */}
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.05, right: base * 0.05, display: "flex", flexDirection: portrait ? "column" : "row", justifyContent: "space-between", alignItems: portrait ? "center" : "flex-start", gap: base * 0.015 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>{title}</div>
        <div style={{ display: "flex", gap: base * 0.012 }}>
          {places.map((_, i) => (
            <div key={i} style={{ width: base * 0.028, height: base * 0.028, borderRadius: "50%", background: i < leg || (i === leg && arrived) ? theme.colors.accent : "rgba(255,255,255,0.2)", border: `${Math.max(2, base * 0.003)}px solid ${i === leg ? "#fff" : "transparent"}` }} />
          ))}
        </div>
      </div>
      {showCard && (
        <div style={{ position: "absolute", left: base * 0.05, right: portrait ? base * 0.05 : undefined, bottom: base * 0.06, width: portrait ? undefined : base * 0.9, borderRadius: base * 0.03, background: "rgba(10,18,32,0.9)", border: `1px solid ${theme.colors.accent}55`, padding: `${base * 0.03}px ${base * 0.04}px`, display: "flex", gap: base * 0.03, alignItems: "center", transform: `translateY(${(1 - card) * base * 0.3}px)`, opacity: leg === places.length - 1 ? card : card * cardOut }}>
          <div style={{ fontSize: base * 0.1 }}>{stop.icon}</div>
          <div>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.026, color: theme.colors.accent, letterSpacing: base * 0.003 }}>STOP {leg + 1} · {places[leg].name.toUpperCase()}</div>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.05, color: "#fff" }}>{stop.heading}</div>
            <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.032, color: "rgba(255,255,255,0.8)", lineHeight: 1.35 }}>{stop.text}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
