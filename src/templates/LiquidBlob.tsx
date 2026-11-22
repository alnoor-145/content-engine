import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const liquidBlobSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

// Smooth closed blob path from sine-modulated radii (Catmull-Rom -> cubic Bezier).
const blobPath = (cx: number, cy: number, r: number, t: number, seed: number, points = 8) => {
  const pts = new Array(points).fill(0).map((_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 + 0.18 * Math.sin(t * 0.05 + i * 1.7 + seed) + 0.08 * Math.sin(t * 0.09 + i * 2.3 + seed * 2));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points], p1 = pts[i], p2 = pts[(i + 1) % points], p3 = pts[(i + 2) % points];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
};

// Liquid / blob motion: morphing gooey shapes behind a title.
export const LiquidBlob: React.FC<z.infer<typeof liquidBlobSchema>> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const appear = interpolate(frame, [0, 25], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: theme.colors.background }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.colors.primary} />
            <stop offset="100%" stopColor="#9B6BFF" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.colors.secondary} />
            <stop offset="100%" stopColor="#4DFFB0" />
          </linearGradient>
        </defs>
        <path d={blobPath(width * 0.35, height * 0.42, base * 0.32 * appear, frame, 1)} fill="url(#g1)" opacity={0.9} />
        <path d={blobPath(width * 0.62, height * 0.58, base * 0.26 * appear, frame, 4)} fill="url(#g2)" opacity={0.75} style={{ mixBlendMode: "screen" }} />
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.08 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: "#fff", opacity: interpolate(frame, [15, 35], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.045, color: "#fff", opacity: interpolate(frame, [30, 50], [0, 0.85], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
