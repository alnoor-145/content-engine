import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { z } from "zod";
import { theme } from "../brand/theme";
import { LookCamera } from "../lib/three-helpers";
import { clamp, useBase } from "../lib/useBase";

export const tunnel3DSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  speed: z.number().positive(),
});

const RINGS = 46;
const GAP = 2;
// Winding tunnel centre-line.
const pathAt = (z: number) => [Math.sin(z * 0.08) * 1.6, Math.cos(z * 0.11) * 1.1] as const;

// Warp / wormhole fly-through: neon rings stream past the camera, then the title punches in.
// Great for sci-fi, gaming and high-energy intros.
export const Tunnel3D: React.FC<z.infer<typeof tunnel3DSchema>> = ({ title, subtitle, speed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const base = useBase();
  const camZ = -frame * 0.35 * speed;
  const [cx, cy] = pathAt(camZ);
  const [tx, ty] = pathAt(camZ - 8);
  const revealAt = durationInFrames - 70;
  const reveal = spring({ frame: frame - revealAt, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 70, far: 120 }}>
        <LookCamera position={[cx, cy, camZ]} target={[tx, ty, camZ - 8]} />
        <fog attach="fog" args={["#000000", 10, 70]} />
        {Array.from({ length: RINGS }).map((_, i) => {
          // Recycle rings so the tunnel never ends.
          const span = RINGS * GAP;
          const z = camZ - 2 - ((((i * GAP - camZ) % span) + span) % span);
          const [x, y] = pathAt(z);
          const color = new THREE.Color().setHSL(((z * 0.01) % 1 + 1) % 1, 0.9, 0.6);
          return (
            <mesh key={i} position={[x, y, z]} rotation={[0, 0, z * 0.08]}>
              <torusGeometry args={[3, 0.045, 8, 6 + (i % 3) * 2]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.06 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.14, color: "#fff", transform: `scale(${0.3 + reveal * 0.7})`, opacity: Math.min(1, reveal * 1.4), textShadow: `0 0 ${base * 0.03}px ${theme.colors.secondary}, 0 0 ${base * 0.08}px ${theme.colors.primary}` }}>
          {title}
        </div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: theme.colors.secondary, letterSpacing: base * 0.006, opacity: interpolate(frame, [revealAt + 15, revealAt + 30], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
