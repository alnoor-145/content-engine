import { interpolatePath, translatePath } from "@remotion/paths";
import { makeCircle, makeHeart, makePolygon, makeRect, makeStar, makeTriangle } from "@remotion/shapes";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const morphShapesSchema = z.object({
  labels: z.array(z.string()).min(2).max(6),
  framesPerShape: z.number().int().min(20),
});

const S = 400; // shape design box
const center = (info: { path: string; width: number; height: number }) => translatePath(info.path, (S - info.width) / 2, (S - info.height) / 2);
const SHAPES = [
  () => center(makeCircle({ radius: 150 })),
  () => center(makeStar({ points: 5, innerRadius: 80, outerRadius: 175, cornerRadius: 12 })),
  () => center(makeHeart({ height: 300 })),
  () => center(makeTriangle({ length: 320, direction: "up", cornerRadius: 20 })),
  () => center(makePolygon({ points: 6, radius: 160, cornerRadius: 16 })),
  () => center(makeRect({ width: 280, height: 280, cornerRadius: 50 })),
];
const COLORS = [theme.colors.primary, theme.colors.accent, "#FF6BD6", theme.colors.secondary, "#4DFFB0", "#9B6BFF"];

// Shape morphing (logo stings, transitions, "idea evolves" moments): circle → star → heart → … each with a label.
export const MorphShapes: React.FC<z.infer<typeof morphShapesSchema>> = ({ labels, framesPerShape }) => {
  const frame = useCurrentFrame();
  const base = useBase();
  const paths = useMemo(() => labels.map((_, i) => SHAPES[i % SHAPES.length]()), [labels]);
  const morphFrames = Math.min(18, framesPerShape * 0.4);
  const idx = Math.min(labels.length - 1, Math.floor(frame / framesPerShape));
  const local = frame - idx * framesPerShape;
  const next = Math.min(idx + 1, labels.length - 1);
  const t = idx === next ? 0 : interpolate(local, [framesPerShape - morphFrames, framesPerShape], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const d = t === 0 ? paths[idx] : interpolatePath(t, paths[idx], paths[next]);
  const color = interpolateColors(t, [0, 1], [COLORS[idx % COLORS.length], COLORS[next % COLORS.length]]);
  const size = base * 0.55;
  const appear = interpolate(frame, [0, 12], [0, 1], clamp);
  const labelOpacity = interpolate(local, [0, 8, framesPerShape - morphFrames, framesPerShape - morphFrames + 6], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: base * 0.04 }}>
        <svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ transform: `rotate(${t * 90}deg) scale(${appear})`, filter: `drop-shadow(0 0 ${base * 0.04}px ${color}88)`, overflow: "visible" }}>
          <path d={d} fill={color} />
        </svg>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: theme.colors.text, opacity: labelOpacity, transform: `translateY(${(1 - labelOpacity) * base * 0.02}px)` }}>
          {labels[idx]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
