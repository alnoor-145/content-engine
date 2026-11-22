import { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const eidGreetingSchema = z.object({
  greeting: z.string(),
  subtitle: z.string(),
  from: z.string(),
});

const GOLD = "#F7C95C";

// Generic mosque skyline silhouette built from domes, walls and minarets.
const skyline = (w: number, h: number, base: number) => {
  const g = h * 0.86;
  const parts: string[] = [`M0 ${h} L0 ${g}`];
  const unit = w / 12;
  const dome = (cx: number, r: number, wallTop: number) => `L${cx - r} ${g} L${cx - r} ${wallTop} A ${r} ${r * 1.1} 0 0 1 ${cx + r} ${wallTop} L${cx + r} ${g}`;
  const minaret = (cx: number, mw: number, top: number) => `L${cx - mw / 2} ${g} L${cx - mw / 2} ${top} L${cx} ${top - base * 0.05} L${cx + mw / 2} ${top} L${cx + mw / 2} ${g}`;
  parts.push(minaret(unit * 1.2, unit * 0.28, h * 0.55));
  parts.push(dome(unit * 3, unit * 0.9, g - unit * 0.6));
  parts.push(minaret(unit * 4.6, unit * 0.25, h * 0.5));
  parts.push(dome(unit * 6, unit * 1.3, g - unit * 0.9));
  parts.push(minaret(unit * 7.4, unit * 0.25, h * 0.5));
  parts.push(dome(unit * 9, unit * 0.9, g - unit * 0.6));
  parts.push(minaret(unit * 10.8, unit * 0.28, h * 0.55));
  parts.push(`L${w} ${g} L${w} ${h} Z`);
  return parts.join(" ");
};

const Lantern: React.FC<{ x: number; len: number; size: number; phase: number }> = ({ x, len, size, phase }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame * 0.06 + phase) * 7;
  const glow = 0.75 + 0.25 * Math.sin(frame * 0.2 + phase * 3);
  return (
    <g transform={`translate(${x} 0) rotate(${swing})`}>
      <line x1={0} y1={0} x2={0} y2={len} stroke={GOLD} strokeWidth={size * 0.03} opacity={0.7} />
      <g transform={`translate(0 ${len})`}>
        <circle cx={0} cy={size * 0.75} r={size * 1.1} fill="url(#eid-glow)" opacity={glow} />
        <path d={`M ${-size * 0.18} 0 L ${size * 0.18} 0 L ${size * 0.32} ${size * 0.18} L ${-size * 0.32} ${size * 0.18} Z`} fill={GOLD} />
        <path d={`M ${-size * 0.32} ${size * 0.18} L ${size * 0.32} ${size * 0.18} L ${size * 0.45} ${size * 0.75} L ${size * 0.3} ${size * 1.25} L ${-size * 0.3} ${size * 1.25} L ${-size * 0.45} ${size * 0.75} Z`} fill="#3A2A12" stroke={GOLD} strokeWidth={size * 0.04} />
        <path d={`M ${-size * 0.22} ${size * 0.3} L ${size * 0.22} ${size * 0.3} L ${size * 0.3} ${size * 0.75} L ${size * 0.2} ${size * 1.12} L ${-size * 0.2} ${size * 1.12} L ${-size * 0.3} ${size * 0.75} Z`} fill={`rgba(255, 196, 92, ${glow})`} />
        <path d={`M ${-size * 0.3} ${size * 1.25} L ${size * 0.3} ${size * 1.25} L 0 ${size * 1.5} Z`} fill={GOLD} />
      </g>
    </g>
  );
};

// Eid / festival greeting card: crescent moon, twinkling stars, swinging lanterns, mosque skyline,
// gold Bangla greeting and your channel name. Change the text for Eid-ul-Fitr, Eid-ul-Adha, Ramadan…
export const EidGreeting: React.FC<z.infer<typeof eidGreetingSchema>> = ({ greeting, subtitle, from }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const moonIn = spring({ frame, fps, config: { damping: 30 } });
  const textIn = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ x: random(`ex${i}`) * width, y: random(`ey${i}`) * height * 0.75, r: base * (0.0015 + random(`er${i}`) * 0.003), p: random(`ep${i}`) * 6 })), [width, height, base]);
  const moonR = base * 0.12;
  const moonX = width * (portrait ? 0.72 : 0.8);
  const moonY = height * 0.2 + (1 - moonIn) * height * 0.15;
  const lanterns = portrait ? [0.12, 0.3, 0.88] : [0.08, 0.2, 0.33, 0.62];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#060B24 0%, #17204F 60%, #2B2A6B 100%)" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="eid-glow">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>
          <mask id="crescent">
            <rect width={width} height={height} fill="#fff" />
            <circle cx={moonX + moonR * 0.45} cy={moonY - moonR * 0.2} r={moonR * 0.9} fill="#000" />
          </mask>
        </defs>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.35 + 0.65 * Math.abs(Math.sin(frame * 0.05 + s.p))} />
        ))}
        <circle cx={moonX} cy={moonY} r={moonR * 2.2} fill="url(#eid-glow)" opacity={0.6} />
        <circle cx={moonX} cy={moonY} r={moonR} fill={GOLD} mask="url(#crescent)" />
        <path d={`M ${moonX + moonR * 0.9} ${moonY + moonR * 0.1} l ${base * 0.012} ${base * 0.03} l ${base * 0.03} ${base * 0.004} l -${base * 0.024} ${base * 0.02} l ${base * 0.008} ${base * 0.032} l -${base * 0.026} -${base * 0.018} l -${base * 0.026} ${base * 0.018} l ${base * 0.008} -${base * 0.032} l -${base * 0.024} -${base * 0.02} l ${base * 0.03} -${base * 0.004} Z`} fill={GOLD} opacity={moonIn} />
        {lanterns.map((lx, i) => (
          <Lantern key={i} x={width * lx} len={height * (0.12 + (i % 2) * 0.08)} size={base * 0.09} phase={i * 1.7} />
        ))}
        <path d={skyline(width, height, base)} fill="#070A1C" />
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.06, paddingBottom: height * 0.12 }}>
        <div style={{ fontFamily: theme.fonts.bangla, fontWeight: 700, fontSize: base * 0.16, lineHeight: 1.3, transform: `scale(${textIn})`, opacity: textIn, backgroundImage: `linear-gradient(180deg, #FFF3C4, ${GOLD} 55%, #C8902E)`, WebkitBackgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 ${base * 0.02}px rgba(247,201,92,0.45))` }}>
          {greeting}
        </div>
        <div style={{ fontFamily: theme.fonts.bangla, fontWeight: 600, fontSize: base * 0.045, color: "#F3E9D2", opacity: interpolate(frame, [40, 55], [0, 1], clamp) }}>{subtitle}</div>
        <div style={{ marginTop: base * 0.03, fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.035, color: GOLD, letterSpacing: base * 0.004, opacity: interpolate(frame, [55, 70], [0, 1], clamp) }}>— {from}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
