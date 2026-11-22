import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { geoContains, geoMercator, geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, WORLD } from "../lib/geo";
import { clamp, useBase } from "../lib/useBase";

export const mapRouteSchema = z.object({
  title: z.string(),
  stops: z.array(z.object({ name: z.string(), lat: z.number(), lon: z.number() })).min(2),
  view: z.enum(["route", "world"]),
  framesPerLeg: z.number().int().positive(),
});

const START = 20;

// Travel / history route on a real world map: the path draws leg by leg, a dot leads it,
// visited countries light up and each stop gets a label.
export const MapRoute: React.FC<z.infer<typeof mapRouteSchema>> = ({ title, stops, view, framesPerLeg }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();

  const { countryPaths, legs, points, visited } = useMemo(() => {
    const pad = base * 0.12;
    const extent: [[number, number], [number, number]] = [[pad, pad + base * 0.08], [width - pad, height - pad]];
    const projection =
      view === "world"
        ? geoNaturalEarth1().fitExtent(extent, WORLD)
        : geoMercator().fitExtent(extent, { type: "MultiPoint", coordinates: stops.map((s) => [s.lon, s.lat]) });
    const path = geoPath(projection);
    return {
      countryPaths: COUNTRIES.map((c) => path(c) ?? ""),
      legs: stops.slice(1).map((s, i) => path({ type: "LineString", coordinates: [[stops[i].lon, stops[i].lat], [s.lon, s.lat]] }) ?? ""),
      points: stops.map((s) => projection([s.lon, s.lat]) ?? [0, 0]),
      // Index of the first stop inside each country (-1 = none), so countries light up as the route reaches them.
      visited: COUNTRIES.map((c) => stops.findIndex((s) => geoContains(c, [s.lon, s.lat]))),
    };
  }, [stops, view, width, height, base]);

  const stopTime = (i: number) => (i === 0 ? START - 10 : START + i * framesPerLeg - 8);
  const legProgress = (i: number) => interpolate(frame, [START + i * framesPerLeg, START + (i + 1) * framesPerLeg - 6], [0, 1], clamp);
  const active = Math.min(legs.length - 1, Math.max(0, Math.floor((frame - START) / framesPerLeg)));
  const headLen = getLength(legs[active]) * legProgress(active);
  const head = getPointAtLength(legs[active], headLen) ?? { x: points[0][0], y: points[0][1] };

  return (
    <AbsoluteFill style={{ background: "#0A1424" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {countryPaths.map((d, i) => (
          <path key={i} d={d} fill={visited[i] >= 0 && frame >= stopTime(visited[i]) ? `${theme.colors.secondary}55` : "#16263D"} stroke="#24405F" strokeWidth={Math.max(0.6, base * 0.0012)} />
        ))}
        {legs.map((d, i) => {
          const { strokeDasharray, strokeDashoffset } = evolvePath(legProgress(i), d);
          return <path key={i} d={d} fill="none" stroke={theme.colors.accent} strokeWidth={base * 0.006} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />;
        })}
        {frame >= START && frame < START + legs.length * framesPerLeg && (
          <circle cx={head.x} cy={head.y} r={base * 0.014} fill="#fff" stroke={theme.colors.accent} strokeWidth={base * 0.005} />
        )}
        {points.map(([x, y], i) => {
          const pop = spring({ frame: frame - stopTime(i), fps, config: { damping: 10 } });
          const labelW = stops[i].name.length * base * 0.022 + base * 0.03;
          // Flip the label to the left of the pin when it would run off the right edge.
          const flip = x + base * 0.025 + labelW > width - base * 0.02;
          const lx = flip ? -base * 0.025 - labelW : base * 0.025;
          return (
            <g key={i} transform={`translate(${x}, ${y})`} opacity={Math.min(1, pop)}>
              <circle r={base * 0.016 * pop} fill={theme.colors.primary} stroke="#fff" strokeWidth={base * 0.004} />
              <rect x={lx} y={-base * 0.03} rx={base * 0.01} width={labelW} height={base * 0.055} fill="rgba(10,20,36,0.85)" />
              <text x={lx + base * 0.015} y={base * 0.006} fill={theme.colors.text} fontFamily={theme.fonts.heading} fontWeight={700} fontSize={base * 0.034}>{stops[i].name}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: base * 0.05, left: base * 0.06, fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.065, color: theme.colors.text, textShadow: "0 4px 20px rgba(0,0,0,0.6)", opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>
        {title}
      </div>
    </AbsoluteFill>
  );
};
