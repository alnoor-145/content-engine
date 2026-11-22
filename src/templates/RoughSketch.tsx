import { loadFont } from "@remotion/google-fonts/Caveat";
import { evolvePath } from "@remotion/paths";
import { useMemo } from "react";
import rough from "roughjs";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

const { fontFamily: HAND } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const roughSketchSchema = z.object({
  title: z.string(),
  boxes: z.array(z.string()).min(1).max(5),
  framesPerShape: z.number().int().positive(),
});

type Stroke = { d: string; stroke: string; width: number; group: number };

const INK = "#1B1F2A";
const MARKERS = ["#FF4D6D", "#2B9BD8", "#F2A900", "#7A4DFF", "#20B07A"];

// Hand-drawn notebook explainer (Rough.js): sketchy boxes, hatched fills and arrows draw themselves.
export const RoughSketch: React.FC<z.infer<typeof roughSketchSchema>> = ({ title, boxes, framesPerShape }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const n = boxes.length;
  const bw = portrait ? width * 0.6 : Math.min(base * 0.42, (width * 0.82) / n - base * 0.1);
  const bh = portrait ? Math.min(base * 0.22, (height * 0.6) / n - base * 0.08) : base * 0.3;
  const gap = portrait ? (height * 0.62 - n * bh) / Math.max(n - 1, 1) : (width * 0.86 - n * bw) / Math.max(n - 1, 1);
  const pos = (i: number) => (portrait ? { x: (width - bw) / 2, y: height * 0.26 + i * (bh + gap) } : { x: width * 0.07 + i * (bw + gap), y: (height - bh) / 2 + base * 0.06 });

  const strokes = useMemo(() => {
    const gen = rough.generator();
    const out: Stroke[] = [];
    const push = (drawable: ReturnType<typeof gen.rectangle>, group: number) => {
      for (const p of gen.toPaths(drawable)) out.push({ d: p.d, stroke: p.stroke === "none" ? INK : p.stroke, width: p.strokeWidth, group });
    };
    boxes.forEach((_, i) => {
      const { x, y } = pos(i);
      push(gen.rectangle(x, y, bw, bh, { seed: i + 1, roughness: 1.6, stroke: INK, strokeWidth: base * 0.004, fill: MARKERS[i % MARKERS.length], fillStyle: "hachure", hachureGap: base * 0.018, fillWeight: base * 0.002 }), i * 2);
      if (i < n - 1) {
        const a = pos(i);
        const b = pos(i + 1);
        const [x1, y1, x2, y2] = portrait ? [width / 2, a.y + bh + base * 0.015, width / 2, b.y - base * 0.015] : [a.x + bw + base * 0.015, a.y + bh / 2, b.x - base * 0.015, b.y + bh / 2];
        const head = base * 0.03;
        const pts: [number, number][] = portrait ? [[x2 - head, y2 - head], [x2, y2], [x2 + head, y2 - head]] : [[x2 - head, y2 - head], [x2, y2], [x2 - head, y2 + head]];
        push(gen.line(x1, y1, x2, y2, { seed: 50 + i, roughness: 1.4, stroke: INK, strokeWidth: base * 0.004 }), i * 2 + 1);
        push(gen.linearPath(pts, { seed: 70 + i, roughness: 1, stroke: INK, strokeWidth: base * 0.004 }), i * 2 + 1);
      }
    });
    return out;
  }, [boxes, width, height, base]);

  const groupProgress = (g: number) => interpolate(frame, [15 + g * framesPerShape, 15 + (g + 1) * framesPerShape], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: "#FBF8EF" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(43,155,216,0.18) 1px, transparent 1px)", backgroundSize: `100% ${base * 0.05}px` }} />
      <div style={{ position: "absolute", left: base * 0.1, top: 0, bottom: 0, width: 2, background: "rgba(255,77,109,0.35)" }} />
      <div style={{ position: "absolute", top: base * 0.05, width: "100%", textAlign: "center", fontFamily: `${HAND}, ${theme.fonts.bangla}`, fontWeight: 700, fontSize: base * 0.1, color: INK, opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>
        {title}
      </div>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {strokes.map((s, i) => {
          const { strokeDasharray, strokeDashoffset } = evolvePath(groupProgress(s.group), s.d);
          return <path key={i} d={s.d} fill="none" stroke={s.stroke} strokeWidth={s.width} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />;
        })}
      </svg>
      {boxes.map((label, i) => {
        const { x, y } = pos(i);
        const done = groupProgress(i * 2);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: bw, height: bh, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: base * 0.02, fontFamily: `${HAND}, ${theme.fonts.bangla}`, fontWeight: 700, fontSize: Math.min(base * 0.07, bh * 0.35), color: INK, opacity: interpolate(done, [0.6, 1], [0, 1], clamp) }}>
            <span style={{ background: "rgba(251,248,239,0.85)", padding: `0 ${base * 0.012}px`, borderRadius: base * 0.01 }}>{label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
