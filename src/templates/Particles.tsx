import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const particlesSchema = z.object({
  title: z.string(),
  count: z.number().int().min(10).max(600),
  mode: z.enum(["starfield", "float"]),
});

// Particle system: a starfield warp or ambient floating dust behind a title.
export const Particles: React.FC<z.infer<typeof particlesSchema>> = ({ title, count, mode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const colors = [theme.colors.text, theme.colors.secondary, theme.colors.primary];

  return (
    <AbsoluteFill style={{ background: "#03040A", overflow: "hidden" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${k}-${i}`);
        let x: number, y: number, size: number, opacity: number;
        if (mode === "starfield") {
          const z = ((r("z") * 100 - frame * 0.8) % 100 + 100) % 100 + 1;
          const angle = r("a") * Math.PI * 2;
          const dist = (r("d") * base * 0.5) / (z / 100);
          x = width / 2 + Math.cos(angle) * dist;
          y = height / 2 + Math.sin(angle) * dist;
          size = Math.max(1, (1 - z / 100) * base * 0.008);
          opacity = 1 - z / 100;
        } else {
          x = (r("x") * width + Math.sin(frame * 0.02 + i) * 30) % width;
          y = ((r("y") * height - frame * (0.5 + r("s") * 1.5)) % height + height) % height;
          size = base * (0.002 + r("sz") * 0.008);
          opacity = 0.3 + r("o") * 0.7;
        }
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: colors[i % 3], opacity, boxShadow: `0 0 ${size * 3}px ${colors[i % 3]}` }} />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.08 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.11, color: theme.colors.text, letterSpacing: interpolate(frame, [0, 60], [base * 0.03, 0], clamp), opacity: interpolate(frame, [10, 35], [0, 1], clamp), textShadow: `0 0 ${base * 0.04}px ${theme.colors.secondary}` }}>
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
