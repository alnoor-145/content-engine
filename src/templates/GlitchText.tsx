import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { useBase } from "../lib/useBase";

export const glitchTextSchema = z.object({
  text: z.string(),
  intensity: z.number().min(0).max(1),
});

// RGB-split glitch with random slice jitter. Deterministic via remotion's random().
export const GlitchText: React.FC<z.infer<typeof glitchTextSchema>> = ({ text, intensity }) => {
  const frame = useCurrentFrame();
  const base = useBase();
  const burst = random(`burst-${Math.floor(frame / 6)}`) < 0.35 * (0.5 + intensity);
  const j = (seed: string) => (burst ? (random(`${seed}-${frame}`) - 0.5) * base * 0.04 * intensity : 0);

  const layer = (color: string, dx: number, dy: number, blend: React.CSSProperties["mixBlendMode"]) => (
    <div
      style={{
        position: "absolute",
        fontFamily: theme.fonts.heading,
        fontWeight: 900,
        fontSize: base * 0.14,
        letterSpacing: base * 0.005,
        color,
        transform: `translate(${dx}px, ${dy}px)`,
        mixBlendMode: blend,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#05060A", justifyContent: "center", alignItems: "center" }}>
      {layer("#FF003C", j("r") - base * 0.006, j("r2"), "screen")}
      {layer("#00F0FF", j("b") + base * 0.006, j("b2"), "screen")}
      {layer(theme.colors.text, 0, 0, "normal")}
      {burst && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${random(`slice-${frame}`) * 90}%`,
            height: base * 0.03,
            background: `${theme.colors.secondary}55`,
          }}
        />
      )}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)",
        }}
      />
    </AbsoluteFill>
  );
};
