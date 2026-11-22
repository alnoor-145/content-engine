import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { COUNTRIES, WORLD } from "../lib/geo";
import { placeSchema, resolvePlace } from "../lib/places";
import { clamp, useBase } from "../lib/useBase";

export const mapArcsSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  hub: placeSchema,
  destinations: z.array(z.object({ place: placeSchema, value: z.number().nonnegative() })).min(1),
  unit: z.string(),
  // true = arcs fly out of the hub; false = they fly in to the hub.
  outward: z.boolean(),
});

const GRAT = geoGraticule10();

// One-to-many connection map: glowing arcs fly between a hub city and many destinations,
// sized by value, with a running total. Remittances, flights, exports, fans around the world…
export const MapArcs: React.FC<z.infer<typeof mapArcsSchema>> = ({ title, subtitle, hub: hubIn, destinations, unit, outward }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const hub = resolvePlace(hubIn);
  const dests = useMemo(() => destinations.map((d) => ({ ...resolvePlace(d.place), value: d.value })), [destinations]);
  const max = Math.max(...dests.map((d) => d.value), 1);
  const total = dests.reduce((a, d) => a + d.value, 0);

  const proj = useMemo(() => {
    const top = portrait ? h * 0.25 : h * 0.17;
    const bottom = portrait ? h * 0.7 : h * 0.86;
    return geoNaturalEarth1().fitExtent([[base * 0.03, top], [w - base * 0.03, bottom]], WORLD);
  }, [w, h, base, portrait]);
  const path = geoPath(proj);
  const H = proj([hub.lon, hub.lat]) ?? [w / 2, h / 2];

  const arcs = dests.map((d, i) => {
    const D = proj([d.lon, d.lat]) ?? H;
    const [a, b] = outward ? [H, D] : [D, H];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const lift = Math.min(dist * 0.35, base * 0.3);
    const c = [mx, my - lift];
    const start = 20 + i * 10;
    const p = interpolate(frame, [start, start + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const bez = (t: number) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
    const pts: string[] = [];
    for (let k = 0; k <= 40; k++) {
      const [x, y] = bez((k / 40) * p);
      pts.push(`${k ? "L" : "M"}${x} ${y}`);
    }
    const dot = bez(p);
    // a packet that keeps travelling the full arc on loop after it is drawn
    const loop = p >= 1 ? ((frame - start - 40) % 50) / 50 : -1;
    return { d, D, pathD: pts.join(" "), p, dot, loop: loop >= 0 ? bez(loop) : null, width: base * (0.003 + 0.007 * (d.value / max)), start };
  });
  // Simple label de-overlap: if a label would collide with an earlier one, flip it below its dot.
  const placed: { x: number; y: number }[] = [];
  const labelY = arcs.map((a) => {
    let y = a.D[1] - base * 0.02;
    const near = (yy: number) => placed.some((p) => Math.abs(p.x - a.D[0]) < base * 0.12 && Math.abs(p.y - yy) < base * 0.03);
    if (near(y)) y = a.D[1] + base * 0.04;
    if (near(y)) y = a.D[1] + base * 0.075;
    placed.push({ x: a.D[0], y });
    return y;
  });
  const counted = arcs.reduce((acc, a) => acc + a.d.value * (a.p >= 1 ? 1 : 0), 0);
  const shown = interpolate(frame, [20, 20 + dests.length * 10 + 40], [0, total], { ...clamp, easing: Easing.out(Easing.cubic) });
  const hubPulse = (frame % 40) / 40;
  const ranked = [...dests].sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #0F1E3A, #050913 80%)", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={base * 0.006} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={path({ type: "Sphere" }) ?? ""} fill="#0B1730" stroke="rgba(255,255,255,0.08)" />
        <path d={path(GRAT) ?? ""} fill="none" stroke="rgba(255,255,255,0.05)" />
        {COUNTRIES.map((c, i) => <path key={i} d={path(c) ?? ""} fill="#17294A" stroke="#22406B" strokeWidth={0.7} />)}
        <g filter="url(#arc-glow)">
          {arcs.map((a, i) => (
            <g key={i}>
              <path d={a.pathD} fill="none" stroke={theme.colors.secondary} strokeWidth={a.width} strokeLinecap="round" opacity={0.9} />
              {a.p > 0 && a.p < 1 && <circle cx={a.dot[0]} cy={a.dot[1]} r={a.width * 1.6} fill="#fff" />}
              {a.loop && <circle cx={a.loop[0]} cy={a.loop[1]} r={a.width * 1.2} fill={theme.colors.accent} />}
              {a.p >= 1 && (
                <g>
                  <circle cx={a.D[0]} cy={a.D[1]} r={a.width * 1.8} fill={theme.colors.secondary} />
                  <circle cx={a.D[0]} cy={a.D[1]} r={a.width * (2 + spring({ frame: frame - a.start - 40, fps, config: { damping: 8 } }) * 4)} fill="none" stroke={theme.colors.secondary} strokeWidth={base * 0.002} opacity={0.6} />
                  <text x={a.D[0]} y={labelY[i]} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={700} fontSize={base * 0.022} fill="#fff" stroke="#050913" strokeWidth={base * 0.005} paintOrder="stroke">{a.d.name}</text>
                </g>
              )}
            </g>
          ))}
        </g>
        <circle cx={H[0]} cy={H[1]} r={base * (0.015 + hubPulse * 0.05)} fill="none" stroke={theme.colors.accent} strokeWidth={base * 0.003} opacity={1 - hubPulse} />
        <circle cx={H[0]} cy={H[1]} r={base * 0.014} fill={theme.colors.accent} stroke="#fff" strokeWidth={base * 0.003} />
        <text x={H[0]} y={H[1] + base * 0.045} textAnchor="middle" fontFamily={theme.fonts.heading} fontWeight={900} fontSize={base * 0.032} fill={theme.colors.accent} stroke="#050913" strokeWidth={base * 0.006} paintOrder="stroke">{hub.name}</text>
      </svg>
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.05, right: base * 0.05, textAlign: portrait ? "center" : "left" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color: "#fff" }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.03, color: theme.colors.muted }}>{subtitle}</div>
      </div>
      <div style={{ position: "absolute", ...(portrait ? { left: base * 0.06, right: base * 0.06, bottom: base * 0.06 } : { right: base * 0.05, top: base * 0.04 }), textAlign: portrait ? "center" : "right" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: theme.colors.accent, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(shown).toLocaleString("en-US")}{unit}
        </div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.026, color: theme.colors.muted }}>{counted >= total ? "total" : "counting…"}</div>
        {portrait && (
          <div style={{ marginTop: base * 0.02, display: "flex", flexDirection: "column", gap: base * 0.008 }}>
            {ranked.map((d, i) => (
              <div key={i} style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.03, color: "#fff", opacity: interpolate(frame, [60 + i * 8, 75 + i * 8], [0, 1], clamp) }}>
                {i + 1}. {d.name} · {d.value.toLocaleString("en-US")}{unit}
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
