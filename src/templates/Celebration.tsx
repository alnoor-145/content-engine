import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const celebrationSchema = z.object({
  mode: z.enum(["confetti", "fireworks"]),
  title: z.string(),
  subtitle: z.string(),
});

const COLORS = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D", "#FFFFFF"];

// Confetti cannons: pieces fire up from both bottom corners, then flutter down with gravity and drag.
const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const pieces = 220;
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {Array.from({ length: pieces }).map((_, i) => {
        const burst = i % 2 ? 8 : 40; // two bursts
        const t = (frame - burst) / 30;
        if (t < 0) return null;
        const left = i % 4 < 2;
        const r = (k: string) => random(`${k}-${i}`);
        const vx = (left ? 1 : -1) * (0.15 + r("vx") * 0.45) * width;
        const vy = -(0.9 + r("vy") * 0.7) * height;
        const drag = Math.exp(-t * 1.6);
        const x = (left ? -0.02 : 1.02) * width + (vx * (1 - drag)) / 1.6 + Math.sin(t * 6 + i) * base * 0.02 * t;
        const y = height + (vy * (1 - drag)) / 1.6 + 0.35 * height * t * t;
        const w = base * (0.012 + r("w") * 0.012);
        const flutter = Math.cos(t * (8 + r("s") * 10));
        return (
          <rect key={i} x={-w / 2} y={-w * 0.3} width={w} height={w * 0.6} fill={COLORS[i % COLORS.length]} transform={`translate(${x} ${y}) rotate(${t * 360 * (r("rot") - 0.5) * 2}) scale(${flutter} 1)`} />
        );
      })}
    </svg>
  );
};

// Fireworks: rockets climb, burst into glowing sparks that fall and fade, on a night sky.
const Fireworks: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const shells = 7;
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {Array.from({ length: shells }).map((_, s) => {
        const launch = 5 + s * 18;
        const climb = 26;
        const r = (k: string) => random(`${k}-${s}`);
        const x0 = width * (0.15 + r("x") * 0.7);
        const yTop = height * (0.18 + r("y") * 0.25);
        const color = COLORS[s % (COLORS.length - 1)];
        const f = frame - launch;
        if (f < 0) return null;
        if (f < climb) {
          const y = interpolate(f, [0, climb], [height, yTop]);
          return <line key={s} x1={x0} y1={y} x2={x0} y2={y + base * 0.05} stroke="#FFE7B0" strokeWidth={base * 0.004} strokeLinecap="round" />;
        }
        const t = (f - climb) / 30;
        const life = Math.max(0, 1 - t / 1.6);
        if (life <= 0) return null;
        return (
          <g key={s} opacity={life}>
            {t < 0.15 && <circle cx={x0} cy={yTop} r={base * 0.08 * (1 - t / 0.15)} fill="#fff" opacity={0.5} />}
            {Array.from({ length: 64 }).map((_, p) => {
              const a = (p / 64) * Math.PI * 2 + r("a");
              const speed = base * (0.28 + random(`sp-${s}-${p}`) * 0.12);
              const d = (speed * (1 - Math.exp(-t * 2.2))) / 2.2;
              const x = x0 + Math.cos(a) * d;
              const y = yTop + Math.sin(a) * d + 0.25 * base * t * t;
              const tail = base * 0.02;
              return <line key={p} x1={x} y1={y} x2={x - Math.cos(a) * tail} y2={y - Math.sin(a) * tail + base * 0.004} stroke={p % 5 === 0 ? "#fff" : color} strokeWidth={base * 0.004} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// Milestone / celebration moments: "1,000 subscribers", giveaways, results, festivals.
export const Celebration: React.FC<z.infer<typeof celebrationSchema>> = ({ mode, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const pop = spring({ frame: frame - 12, fps, config: { damping: 9 } });
  const shimmer = (frame * 2) % 200;
  return (
    <AbsoluteFill style={{ background: mode === "fireworks" ? "linear-gradient(#050816, #1B1446 70%, #2E1A4F)" : `radial-gradient(circle at 50% 40%, ${theme.colors.surface}, ${theme.colors.background})` }}>
      {mode === "fireworks" ? <Fireworks /> : null}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.06 }}>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: 900,
            fontSize: base * 0.13,
            lineHeight: 1.1,
            transform: `scale(${pop}) rotate(${(1 - pop) * -8}deg)`,
            backgroundImage: `linear-gradient(100deg, ${theme.colors.accent} ${shimmer - 40}%, #fff ${shimmer - 20}%, ${theme.colors.accent} ${shimmer}%)`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 ${base * 0.01}px ${base * 0.02}px rgba(0,0,0,0.5))`,
          }}
        >
          {title}
        </div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.045, color: theme.colors.text, opacity: interpolate(frame, [30, 45], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
      {mode === "confetti" ? <Confetti /> : null}
    </AbsoluteFill>
  );
};
