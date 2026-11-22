import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const lineDrawSchema = z.object({
  caption: z.string(),
  // SVG path data in a 0..1000 viewBox. Draw shapes in Inkscape/Figma and paste the "d" attribute.
  paths: z.array(z.string()),
  paper: z.enum(["whiteboard", "chalkboard", "blueprint"]),
});

const papers = {
  whiteboard: { bg: "#FAFAF7", ink: "#1B1F2A", text: "#1B1F2A" },
  chalkboard: { bg: "#1F3B2D", ink: "#F2F2E9", text: "#F2F2E9" },
  blueprint: { bg: "#0F3D7A", ink: "#CFE6FF", text: "#FFFFFF" },
};

// Whiteboard / chalkboard / blueprint line drawing: paths draw themselves one after another.
export const LineDraw: React.FC<z.infer<typeof lineDrawSchema>> = ({ caption, paths, paper }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const base = useBase();
  const p = papers[paper];
  const drawEnd = durationInFrames * 0.75;
  const per = drawEnd / Math.max(paths.length, 1);

  return (
    <AbsoluteFill style={{ background: p.bg, justifyContent: "center", alignItems: "center" }}>
      {paper === "blueprint" && (
        <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: `${base * 0.05}px ${base * 0.05}px` }} />
      )}
      <svg viewBox="0 0 1000 1000" style={{ width: base * 0.8, height: base * 0.8 }}>
        {paths.map((d, i) => {
          const progress = interpolate(frame, [i * per, (i + 1) * per], [0, 1], clamp);
          const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);
          return (
            <path key={i} d={d} fill="none" stroke={p.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: base * 0.06,
          fontFamily: paper === "whiteboard" ? "'Comic Sans MS', 'Segoe Print', cursive" : theme.fonts.heading,
          fontSize: base * 0.055,
          color: p.text,
          opacity: interpolate(frame, [drawEnd - 10, drawEnd + 5], [0, 1], clamp),
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};
