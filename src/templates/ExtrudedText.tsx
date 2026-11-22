import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const extrudedTextSchema = z.object({
  lines: z.array(z.string()).min(1),
  depth: z.number().int().min(4).max(40),
  faceColor: z.string(),
  sideColor: z.string(),
});

// Fake-3D extruded title: a stack of shadows whose direction swings over time,
// so the block letters look like they rotate in space. Cheap, crisp, works with Bangla.
export const ExtrudedText: React.FC<z.infer<typeof extrudedTextSchema>> = ({ lines, depth, faceColor, sideColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const enter = spring({ frame, fps, config: { damping: 11 } });
  const grow = interpolate(frame, [5, 30], [0, 1], clamp);
  const angle = (-35 + Math.sin(frame * 0.04) * 35) * (Math.PI / 180);
  const step = base * 0.0028;
  const layers = Math.round(depth * grow);

  const shadow = [
    ...Array.from({ length: layers }, (_, i) => `${Math.cos(angle) * step * (i + 1)}px ${Math.sin(angle + Math.PI / 2) * step * (i + 1)}px 0 ${sideColor}`),
    `${Math.cos(angle) * step * (layers + 6)}px ${Math.sin(angle + Math.PI / 2) * step * (layers + 6)}px ${base * 0.02}px rgba(0,0,0,0.55)`,
  ].join(", ");

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.06, perspective: base * 2 }}>
        <div style={{ transform: `scale(${0.5 + 0.5 * enter}) rotateX(${(1 - enter) * 60}deg)`, opacity: enter }}>
          {lines.map((l, i) => (
            <div key={i} style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.15, lineHeight: 1.15, color: faceColor, textShadow: shadow, textTransform: "uppercase", letterSpacing: base * 0.003 }}>
              {l}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
