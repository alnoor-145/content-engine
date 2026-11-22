import { useMemo } from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const cityNightSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

type Building = { x: number; w: number; h: number; litAt: number[] };

// Flat 2D city: the sky turns from day to sunset to night, the sun sets, the moon and stars come out,
// windows light up one by one and car lights stream along the road. Calm intros, vlogs, "a day in the life".
export const CityNight: React.FC<z.infer<typeof cityNightSchema>> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const base = useBase();
  const p = frame / durationInFrames; // 0 day → 1 night
  const roadY = height * 0.86;

  const layers = useMemo(
    () =>
      [0, 1, 2].map((layer) => {
        const out: Building[] = [];
        let x = -base * 0.05;
        let i = 0;
        while (x < width + base * 0.1) {
          const w = base * (0.08 + random(`w${layer}-${i}`) * 0.1) * (1 + layer * 0.2);
          const h = height * (0.2 + random(`h${layer}-${i}`) * 0.3) * (1 - layer * 0.18);
          const cols = Math.max(2, Math.floor(w / (base * 0.028)));
          const rows = Math.max(3, Math.floor(h / (base * 0.04)));
          out.push({ x, w, h, litAt: Array.from({ length: cols * rows }, (_, k) => 0.45 + random(`l${layer}-${i}-${k}`) * 0.5) });
          x += w + base * 0.006;
          i++;
        }
        return out;
      }),
    [width, height, base],
  );

  const skyTop = interpolateColors(p, [0, 0.45, 0.7, 1], ["#5DB4F0", "#F2795B", "#3A2A6B", "#0A1030"]);
  const skyBottom = interpolateColors(p, [0, 0.45, 0.7, 1], ["#CDEBFF", "#FFC78A", "#8A4F7D", "#24285B"]);
  const sunY = interpolate(p, [0, 0.6], [height * 0.18, height * 0.8], clamp);
  const moonY = interpolate(p, [0.55, 1], [height * 0.6, height * 0.16], clamp);
  const night = interpolate(p, [0.55, 0.85], [0, 1], clamp);
  const layerColors = [
    interpolateColors(p, [0, 0.5, 1], ["#9DB7D5", "#B36A79", "#232A55"]),
    interpolateColors(p, [0, 0.5, 1], ["#6F8FB5", "#80455F", "#171C40"]),
    interpolateColors(p, [0, 0.5, 1], ["#45628A", "#4E2944", "#0D112B"]),
  ];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${skyTop}, ${skyBottom})` }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {Array.from({ length: 70 }).map((_, i) => (
          <circle key={i} cx={random(`sx${i}`) * width} cy={random(`sy${i}`) * height * 0.5} r={base * 0.002} fill="#fff" opacity={night * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i)))} />
        ))}
        <circle cx={width * 0.75} cy={sunY} r={base * 0.07} fill="#FFD36B" opacity={1 - night} />
        <circle cx={width * 0.22} cy={moonY} r={base * 0.05} fill="#F4F1DE" opacity={night} />
        {layers.map((buildings, li) => {
          const drift = -frame * (0.15 + li * 0.25);
          const bottom = roadY - li * base * 0.0;
          return (
            <g key={li} transform={`translate(${drift % (base * 0.2)} 0)`}>
              {buildings.map((b, bi) => {
                const cols = Math.max(2, Math.floor(b.w / (base * 0.028)));
                const rows = Math.max(3, Math.floor(b.h / (base * 0.04)));
                const ww = (b.w * 0.6) / cols;
                const wh = (b.h * 0.55) / rows;
                return (
                  <g key={bi}>
                    <rect x={b.x} y={bottom - b.h} width={b.w} height={b.h} fill={layerColors[li]} />
                    {li > 0 &&
                      b.litAt.map((t, k) => {
                        if (p < t) return null;
                        const cx = k % cols;
                        const cy = Math.floor(k / cols);
                        return <rect key={k} x={b.x + b.w * 0.2 + cx * (b.w * 0.6) / cols + ww * 0.2} y={bottom - b.h + b.h * 0.1 + cy * (b.h * 0.8) / rows} width={ww * 0.6} height={wh * 0.6} fill="#FFD77A" opacity={0.9} />;
                      })}
                  </g>
                );
              })}
            </g>
          );
        })}
        <rect x={0} y={roadY} width={width} height={height - roadY} fill={interpolateColors(p, [0, 1], ["#3B4252", "#0B0E1A"])} />
        {Array.from({ length: 12 }).map((_, i) => {
          const right = i % 2 === 0;
          const speed = base * (0.012 + random(`cs${i}`) * 0.01);
          const span = width + base * 0.4;
          const x = right ? ((frame * speed + random(`cx${i}`) * span) % span) - base * 0.2 : span - ((frame * speed + random(`cx${i}`) * span) % span) - base * 0.2;
          const y = roadY + (right ? 0.35 : 0.65) * (height - roadY);
          return <rect key={i} x={x} y={y - base * 0.004} width={base * 0.07} height={base * 0.008} rx={base * 0.004} fill={right ? "#FFF6D8" : "#FF4D4D"} opacity={0.3 + night * 0.7} />;
        })}
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: height * 0.1, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.09, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.35)", opacity: interpolate(frame, [10, 25], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: "rgba(255,255,255,0.85)", opacity: interpolate(frame, [20, 35], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
