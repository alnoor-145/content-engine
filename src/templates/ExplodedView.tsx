import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const explodedViewSchema = z.object({
  title: z.string(),
  // Top to bottom.
  layers: z.array(z.string()).min(2).max(7),
});

const COLORS = ["rgba(77,212,255,0.35)", "#151B2E", "#FFD84D", "#2E7D5B", "#3A3F52", "#9B6BFF", "#FF4D6D"];

// Exploded view: a stacked product (phone, PC, burger, org chart…) separates into labelled layers in 3D.
export const ExplodedView: React.FC<z.infer<typeof explodedViewSchema>> = ({ title, layers }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const base = useBase();
  const size = base * 0.42;
  const explode = spring({ frame: frame - 25, fps, config: { damping: 16, mass: 1.4 } });
  const gap = Math.min(base * 0.11, (height * 0.55) / layers.length);
  const spin = interpolate(frame, [0, 300], [-35, -15]);
  const n = layers.length;

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.05, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.065, color: theme.colors.text, opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>{title}</div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: base * 4, paddingTop: base * 0.08 }}>
        <div style={{ position: "relative", width: size, height: size, transformStyle: "preserve-3d", transform: `rotateX(58deg) rotateZ(${spin}deg)` }}>
          {layers.map((label, i) => {
            const z = ((n - 1) / 2 - i) * (base * 0.012 + gap * explode);
            const labelIn = interpolate(explode, [0.5 + i * 0.05, 0.9 + i * 0.02], [0, 1], clamp);
            return (
              <div key={i} style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateZ(${z}px)` }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: size * 0.08, background: COLORS[i % COLORS.length], border: `${Math.max(2, base * 0.003)}px solid rgba(255,255,255,0.35)`, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }} />
                {/* Billboard the label: undo the parent's rotation so text faces the camera. */}
                <div style={{ position: "absolute", left: size * 1.02, top: size * 0.5, transformOrigin: "0 0", transform: `rotateZ(${-spin}deg) rotateX(-58deg)`, display: "flex", alignItems: "center", gap: base * 0.012, opacity: labelIn, whiteSpace: "nowrap" }}>
                  <div style={{ width: base * 0.08 * labelIn, height: Math.max(2, base * 0.003), background: theme.colors.text }} />
                  <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.035, color: theme.colors.text, background: "rgba(11,15,26,0.7)", padding: `${base * 0.004}px ${base * 0.012}px`, borderRadius: base * 0.008 }}>{label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
