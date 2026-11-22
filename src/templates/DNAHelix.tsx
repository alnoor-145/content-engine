import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { LookCamera } from "../lib/three-helpers";
import { clamp, useBase } from "../lib/useBase";

export const dnaHelixSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  pairs: z.number().int().min(10).max(60),
});

const BASES = [["#4DFFB0", "#FF4D6D"], ["#FFD84D", "#4DD4FF"]]; // A–T, G–C
const R = 1.15;

// Rotating DNA double helix that assembles pair by pair. For biology, health and science explainers.
export const DNAHelix: React.FC<z.infer<typeof dnaHelixSchema>> = ({ title, subtitle, pairs }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const spin = frame * 0.025;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #10233D, #04070F 75%)` }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 45 }}>
        <LookCamera position={portrait ? [0, 0, 15] : [0, 0, 11]} target={[0, 0, 0]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 6]} intensity={2} />
        <pointLight position={[-5, -3, 4]} intensity={40} color={theme.colors.primary} />
        {/* Outer group tilts the helix; inner group spins it around its own axis. */}
        <group rotation={[0, 0, portrait ? 0.15 : Math.PI / 2.4]}>
        <group rotation={[0, spin, 0]}>
          {Array.from({ length: pairs }).map((_, i) => {
            const a = i * 0.42;
            const y = (i - pairs / 2) * 0.28;
            const pop = spring({ frame: frame - 4 - i * 1.5, fps, config: { damping: 12 } });
            const [c1, c2] = BASES[i % 2];
            const flip = i % 3 === 0;
            return (
              <group key={i} position={[0, y, 0]} rotation={[0, -a, 0]} scale={pop}>
                <mesh position={[R, 0, 0]}>
                  <sphereGeometry args={[0.16, 20, 20]} />
                  <meshStandardMaterial color={theme.colors.secondary} roughness={0.3} metalness={0.2} />
                </mesh>
                <mesh position={[-R, 0, 0]}>
                  <sphereGeometry args={[0.16, 20, 20]} />
                  <meshStandardMaterial color={theme.colors.primary} roughness={0.3} metalness={0.2} />
                </mesh>
                <mesh position={[R / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.055, 0.055, R, 12]} />
                  <meshStandardMaterial color={flip ? c2 : c1} roughness={0.5} />
                </mesh>
                <mesh position={[-R / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.055, 0.055, R, 12]} />
                  <meshStandardMaterial color={flip ? c1 : c2} roughness={0.5} />
                </mesh>
              </group>
            );
          })}
        </group>
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: portrait ? "flex-start" : "flex-end", alignItems: "center", padding: base * 0.07, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: "#fff", opacity: interpolate(frame, [15, 30], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.036, color: "rgba(255,255,255,0.7)" }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
