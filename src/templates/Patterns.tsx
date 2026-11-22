import { noise3D } from "@remotion/noise";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const patternsSchema = z.object({
  mode: z.enum(["bauhaus", "opart", "generative"]),
  title: z.string(),
  subtitle: z.string(),
});

const BAUHAUS = ["#E63946", "#F4C430", "#1D3557", "#111111", "#F1FAEE"];

// Bauhaus / Swiss grid: tiles of quarter-circles, half-circles and squares that rotate in steps.
const Bauhaus: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const cols = width > height ? 8 : 5;
  const cell = width / cols;
  const rows = Math.ceil(height / cell);
  const tile = (i: number) => {
    const kind = Math.floor(random(`k${i}`) * 4);
    const fg = BAUHAUS[Math.floor(random(`c${i}`) * 4)];
    const bg = BAUHAUS[(Math.floor(random(`b${i}`) * 4) + 1) % 5];
    const steps = Math.floor(frame / 30);
    const spin = Array.from({ length: steps + 1 }).reduce<number>((acc, _, s) => acc + (random(`r${i}-${s}`) > 0.6 ? spring({ frame: frame - s * 30 - (i % cols) * 2, fps, config: { damping: 14 } }) : 0), 0);
    const shape =
      kind === 0 ? <path d={`M 0 0 L ${cell} 0 A ${cell} ${cell} 0 0 1 0 ${cell} Z`} fill={fg} /> :
      kind === 1 ? <path d={`M 0 ${cell / 2} A ${cell / 2} ${cell / 2} 0 0 1 ${cell} ${cell / 2} Z`} fill={fg} /> :
      kind === 2 ? <circle cx={cell / 2} cy={cell / 2} r={cell * 0.32} fill={fg} /> :
      <rect x={cell * 0.2} y={cell * 0.2} width={cell * 0.6} height={cell * 0.6} fill={fg} />;
    return { bg, shape, rot: Math.round(random(`r0${i}`) * 3) * 90 + spin * 90 };
  };
  const enter = (i: number) => spring({ frame: frame - (i % cols) - Math.floor(i / cols) * 2, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ background: BAUHAUS[4] }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const t = tile(i);
          const x = (i % cols) * cell;
          const y = Math.floor(i / cols) * cell;
          const e = enter(i);
          return (
            <g key={i} transform={`translate(${x + cell / 2}, ${y + cell / 2}) rotate(${t.rot}) scale(${e}) translate(${-cell / 2}, ${-cell / 2})`}>
              <rect width={cell} height={cell} fill={t.bg} />
              {t.shape}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: base * 0.06, bottom: base * 0.06, background: BAUHAUS[4], padding: `${base * 0.03}px ${base * 0.04}px`, borderLeft: `${base * 0.025}px solid ${BAUHAUS[0]}`, opacity: interpolate(frame, [20, 35], [0, 1], clamp) }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.09, color: "#111", lineHeight: 1, letterSpacing: -base * 0.002 }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.03, color: "#111", marginTop: base * 0.01, textTransform: "uppercase", letterSpacing: base * 0.004 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

// Op-art: two sets of concentric rings whose centers orbit, producing a hypnotic moiré loop.
const OpArt: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const R = Math.hypot(width, height);
  const ringW = base * 0.022;
  const rings = Math.ceil(R / (ringW * 2));
  const a = frame * 0.04;
  const c1 = [width / 2 + Math.cos(a) * base * 0.08, height / 2 + Math.sin(a) * base * 0.08];
  const c2 = [width / 2 - Math.cos(a) * base * 0.08, height / 2 - Math.sin(a * 1.3) * base * 0.08];
  return (
    <AbsoluteFill style={{ background: "#F4F1EA" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {[c1, c2].map((c, k) => (
          <g key={k} opacity={k ? 0.85 : 1} style={{ mixBlendMode: "difference" }}>
            {Array.from({ length: rings }).map((_, i) => (
              <circle key={i} cx={c[0]} cy={c[1]} r={(i + 0.5) * ringW * 2} fill="none" stroke={k ? "#F4F1EA" : "#111"} strokeWidth={ringW} />
            ))}
          </g>
        ))}
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", mixBlendMode: "difference" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.14, color: "#fff", opacity: interpolate(frame, [10, 25], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.035, color: "#fff", letterSpacing: base * 0.006 }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Generative flow field: hundreds of lines traced through 3D Perlin noise that evolves over time.
const Generative: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const count = 260;
  const steps = 22;
  const stepLen = base * 0.012;
  const z = frame * 0.006;
  const colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF"];
  const lines = Array.from({ length: count }, (_, i) => {
    let x = random(`x${i}`) * width;
    let y = random(`y${i}`) * height;
    const pts = [`M ${x.toFixed(1)} ${y.toFixed(1)}`];
    for (let s = 0; s < steps; s++) {
      const angle = noise3D("flow", x / (base * 0.6), y / (base * 0.6), z) * Math.PI * 2;
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return { d: pts.join(" "), color: colors[i % colors.length] };
  });
  return (
    <AbsoluteFill style={{ background: "#07080F" }}>
      <svg width={width} height={height} style={{ position: "absolute", opacity: interpolate(frame, [0, 20], [0, 1], clamp) }}>
        {lines.map((l, i) => (
          <path key={i} d={l.d} fill="none" stroke={l.color} strokeWidth={base * 0.0025} strokeLinecap="round" opacity={0.7} />
        ))}
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.11, color: theme.colors.text, textShadow: "0 0 40px #07080F, 0 0 20px #07080F", opacity: interpolate(frame, [15, 30], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted, textShadow: "0 0 20px #07080F" }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Abstract pattern backgrounds/intros: Bauhaus-Swiss grid, op-art moiré, or generative flow field.
export const Patterns: React.FC<z.infer<typeof patternsSchema>> = ({ mode, title, subtitle }) =>
  mode === "bauhaus" ? <Bauhaus title={title} subtitle={subtitle} /> : mode === "opart" ? <OpArt title={title} subtitle={subtitle} /> : <Generative title={title} subtitle={subtitle} />;
