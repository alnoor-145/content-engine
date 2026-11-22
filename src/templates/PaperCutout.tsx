import { noise2D } from "@remotion/noise";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const paperCutoutSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  palette: z.enum(["sunset", "forest", "ocean"]),
});

const PALETTES = {
  sunset: { sky: "#FFE3C2", sun: "#FF7A59", layers: ["#F6B38E", "#E98A6B", "#C8604F", "#8E3B46", "#5B2338"] },
  forest: { sky: "#E6F2D9", sun: "#F7C948", layers: ["#B7D8A0", "#8CC07A", "#5E9E5A", "#3C7A47", "#24543A"] },
  ocean: { sky: "#DDF1F8", sun: "#FFD166", layers: ["#A8DADC", "#7BC4CF", "#4FA3B8", "#2E7A9A", "#1D4E6E"] },
};

// Paper cut-out / collage look: stacked torn-paper hills with drop shadows slide up in parallax,
// a paper sun rises, and the title sits on a torn paper label. Great for kids & storytelling.
export const PaperCutout: React.FC<z.infer<typeof paperCutoutSchema>> = ({ title, subtitle, palette }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const pal = PALETTES[palette];

  const hills = useMemo(
    () =>
      pal.layers.map((_, li) => {
        const yBase = height * (0.5 + li * 0.1);
        const pts: string[] = [`M 0 ${height}`];
        for (let x = 0; x <= width + 20; x += width / 80) {
          const y = yBase + noise2D(`hill-${li}`, x / (width * 0.35), li) * height * 0.07 + (random(`j-${li}-${x}`) - 0.5) * base * 0.006;
          pts.push(`L ${x} ${y}`);
        }
        pts.push(`L ${width} ${height} Z`);
        return pts.join(" ");
      }),
    [pal, width, height, base],
  );

  const label = useMemo(() => {
    // Torn-edge rectangle: jitter points along each edge.
    const w = Math.min(width * 0.8, base * 1.2);
    const h = base * 0.3;
    const pts: [number, number][] = [];
    const edge = (x0: number, y0: number, x1: number, y1: number, seed: string) => {
      for (let i = 0; i < 24; i++) {
        const t = i / 24;
        const j = (random(`${seed}-${i}`) - 0.5) * base * 0.012;
        pts.push([x0 + (x1 - x0) * t + (y0 === y1 ? 0 : j), y0 + (y1 - y0) * t + (y0 === y1 ? j : 0)]);
      }
    };
    edge(0, 0, w, 0, "t");
    edge(w, 0, w, h, "r");
    edge(w, h, 0, h, "b");
    edge(0, h, 0, 0, "l");
    return { w, h, d: `M ${pts.map((p) => p.join(" ")).join(" L ")} Z` };
  }, [width, base]);

  const sunRise = spring({ frame: frame - 5, fps, config: { damping: 30 } });
  const labelIn = spring({ frame: frame - 30, fps, config: { damping: 12 } });
  const wobble = (seed: number) => Math.sin(frame * 0.05 + seed) * base * 0.004;

  return (
    <AbsoluteFill style={{ background: pal.sky }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <filter id="paper-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy={-base * 0.006} stdDeviation={base * 0.008} floodColor="#000" floodOpacity="0.28" />
          </filter>
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <circle cx={width * 0.72} cy={height * 0.55 - sunRise * height * 0.28} r={base * 0.12} fill={pal.sun} filter="url(#paper-shadow)" />
        {hills.map((d, i) => {
          const p = spring({ frame: frame - i * 4, fps, config: { damping: 18 } });
          return (
            <g key={i} transform={`translate(${wobble(i)}, ${(1 - p) * height * 0.5})`}>
              <path d={d} fill={pal.layers[i]} filter="url(#paper-shadow)" />
              <path d={d} fill={pal.layers[i]} filter="url(#paper-grain)" />
            </g>
          );
        })}
      </svg>
      {(title || subtitle) && <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: height * 0.12 }}>
        <div style={{ position: "relative", width: label.w, height: label.h, transform: `rotate(${-2 + (1 - labelIn) * -12}deg) scale(${labelIn})` }}>
          <svg width={label.w} height={label.h} style={{ position: "absolute", overflow: "visible" }}>
            <path d={label.d} fill="#FFFDF7" filter="url(#paper-shadow)" />
          </svg>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.085, color: pal.layers[4], lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.035, color: pal.layers[3], opacity: interpolate(frame, [45, 60], [0, 1], clamp) }}>{subtitle}</div>
          </AbsoluteFill>
        </div>
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};
