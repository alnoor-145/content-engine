import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const isometricSchema = z.object({
  title: z.string(),
  // Heights of a 4x4 grid of blocks (0 = empty), row by row. Great for cities, charts, "building" metaphors.
  heights: z.array(z.number().min(0).max(5)).length(16),
});

const Block: React.FC<{ size: number; h: number; color: string }> = ({ size, h, color }) => {
  const H = size * h;
  const face = (t: string, bg: string, w: number, hh: number): React.CSSProperties => ({ position: "absolute", left: 0, top: 0, width: w, height: hh, background: bg, transform: t, transformOrigin: "0 0" });
  return (
    <div style={{ position: "absolute", width: size, height: size, transformStyle: "preserve-3d" }}>
      {/* front wall (y = size), rising from z=0 to z=H */}
      <div style={{ ...face(`translateY(${size}px) rotateX(90deg)`, color, size, H), filter: "brightness(0.72)" }} />
      {/* right wall (x = size) */}
      <div style={{ ...face(`translateX(${size}px) rotateY(-90deg)`, color, H, size), filter: "brightness(0.5)" }} />
      {/* top */}
      <div style={face(`translateZ(${H}px)`, color, size, size)} />
    </div>
  );
};

// Isometric grid of 3D blocks that rise in a wave (CSS 3D, no WebGL needed).
export const Isometric: React.FC<z.infer<typeof isometricSchema>> = ({ title, heights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const cell = base * 0.09;
  const colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF"];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${theme.colors.surface}, ${theme.colors.background})` }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: base * 4 }}>
        <div style={{ position: "relative", width: cell * 4, height: cell * 4, transformStyle: "preserve-3d", transform: `rotateX(60deg) rotateZ(${45 + interpolate(frame, [0, 300], [0, 30])}deg)` }}>
          <div style={{ position: "absolute", inset: -cell * 0.3, background: "rgba(255,255,255,0.05)", borderRadius: cell * 0.2 }} />
          {heights.map((h, i) => {
            const x = i % 4, y = Math.floor(i / 4);
            const rise = spring({ frame: frame - (x + y) * 4, fps, config: { damping: 12 } });
            if (h === 0) return null;
            return (
              <div key={i} style={{ position: "absolute", left: x * cell, top: y * cell, transformStyle: "preserve-3d" }}>
                <Block size={cell * 0.86} h={Math.max(0.05, h * rise * 0.6)} color={colors[(x + y) % colors.length]} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: base * 0.08, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.075, color: theme.colors.text, opacity: interpolate(frame, [20, 40], [0, 1], clamp) }}>
        {title}
      </div>
    </AbsoluteFill>
  );
};
