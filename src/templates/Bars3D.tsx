import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { LookCamera } from "../lib/three-helpers";
import { clamp, useBase } from "../lib/useBase";

export const bars3DSchema = z.object({
  title: z.string(),
  unit: z.string(),
  bars: z.array(z.object({ label: z.string(), value: z.number().nonnegative() })).min(1).max(10),
});

const PALETTE = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D", "#FF6BD6", "#6BFF6B", "#4D7CFF", "#FFFFFF"];

// 3D bar chart: glossy columns grow on a platform while the camera circles; a legend lists the values.
export const Bars3D: React.FC<z.infer<typeof bars3DSchema>> = ({ title, unit, bars }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const n = bars.length;
  const gap = 1.3;
  const a = -0.5 + Math.sin(frame * 0.012) * 0.35;
  const dist = portrait ? 17 : 12;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(${theme.colors.surface}, #05070D)` }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40 }}>
        <LookCamera position={[Math.sin(a) * dist, 5.5, Math.cos(a) * dist]} target={[0, 1.6, 0]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 10, 6]} intensity={2.2} />
        <pointLight position={[-6, 4, -4]} intensity={30} color={theme.colors.secondary} />
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[n * gap + 1, 0.2, 2.4]} />
          <meshStandardMaterial color="#1A2033" roughness={0.6} />
        </mesh>
        {bars.map((b, i) => {
          const grow = spring({ frame: frame - 10 - i * 5, fps, config: { damping: 15 } });
          const h = Math.max(0.02, (b.value / max) * 4.2 * grow);
          return (
            <mesh key={i} position={[(i - (n - 1) / 2) * gap, h / 2, 0]}>
              <boxGeometry args={[0.85, h, 0.85]} />
              <meshStandardMaterial color={PALETTE[i % PALETTE.length]} roughness={0.25} metalness={0.25} />
            </mesh>
          );
        })}
      </ThreeCanvas>
      <div style={{ position: "absolute", top: base * 0.06, left: base * 0.06, right: base * 0.06, fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.065, color: theme.colors.text, textAlign: portrait ? "center" : "left" }}>{title}</div>
      <div style={{ position: "absolute", ...(portrait ? { bottom: base * 0.08, left: base * 0.08 } : { top: base * 0.2, left: base * 0.06 }), display: "flex", flexDirection: "column", gap: base * 0.014 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.015, opacity: interpolate(frame, [12 + i * 5, 24 + i * 5], [0, 1], clamp) }}>
            <div style={{ width: base * 0.028, height: base * 0.028, borderRadius: base * 0.006, background: PALETTE[i % PALETTE.length] }} />
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.032, color: theme.colors.text }}>
              {b.label} <span style={{ color: theme.colors.muted }}>· {b.value.toLocaleString()}{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
