import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const lineChartSchema = z.object({
  title: z.string(),
  unit: z.string(),
  points: z.array(z.object({ label: z.string(), value: z.number() })).min(2),
});

const DRAW_START = 15;
const DRAW_FRAMES = 70;

// Line chart that draws itself left to right; dots pop as the line reaches them.
export const LineChart: React.FC<z.infer<typeof lineChartSchema>> = ({ title, unit, points }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const W = width - base * 0.2;
  const H = height * 0.55;
  const max = Math.max(...points.map((p) => p.value)) * 1.1;
  const min = Math.min(0, ...points.map((p) => p.value));
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const d = points.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.value)}`).join(" ");
  const progress = interpolate(frame, [DRAW_START, DRAW_START + DRAW_FRAMES], [0, 1], clamp);
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);
  const reached = Math.floor(progress * (points.length - 1) + 1e-6);
  const area = `${d} L ${W} ${H} L 0 ${H} Z`;

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: base * 0.1, top: base * 0.07, fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.065, color: theme.colors.text, opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>{title}</div>
      <svg width={W} height={H + base * 0.08} style={{ position: "absolute", left: base * 0.1, top: (height - H) / 2 + base * 0.04, overflow: "visible" }}>
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.secondary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={theme.colors.secondary} stopOpacity={0} />
          </linearGradient>
          <clipPath id="lc-clip">
            <rect x={0} y={-base} width={W * progress} height={H + base * 2} />
          </clipPath>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        ))}
        <path d={area} fill="url(#lc-area)" clipPath="url(#lc-clip)" />
        <path d={d} fill="none" stroke={theme.colors.secondary} strokeWidth={base * 0.008} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
        {points.map((p, i) => {
          const pop = i <= reached ? spring({ frame: frame - DRAW_START - (i / (points.length - 1)) * DRAW_FRAMES, fps, config: { damping: 10 } }) : 0;
          return (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={base * 0.014 * pop} fill={theme.colors.background} stroke={theme.colors.accent} strokeWidth={base * 0.006} />
              <text x={x(i)} y={H + base * 0.055} textAnchor="middle" fill={theme.colors.muted} fontSize={base * 0.028} fontFamily={theme.fonts.body}>{p.label}</text>
              {i === reached && (
                <text x={x(i)} y={y(p.value) - base * 0.035} textAnchor="middle" fill={theme.colors.text} fontSize={base * 0.04} fontWeight={800} fontFamily={theme.fonts.heading} opacity={pop}>
                  {p.value.toLocaleString()}{unit}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
