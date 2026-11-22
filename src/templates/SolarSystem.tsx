import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { z } from "zod";
import { theme } from "../brand/theme";
import { LookCamera, StarField } from "../lib/three-helpers";
import { clamp, useBase } from "../lib/useBase";

export const solarSystemSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  speed: z.number().positive(),
});

// Not to scale — sized for readability. [radius, orbit distance, orbit speed, color]
const PLANETS: [number, number, number, string][] = [
  [0.12, 1.7, 4.1, "#B1A89D"],
  [0.2, 2.3, 1.6, "#E8C48A"],
  [0.22, 3.0, 1.0, "#3E8EDE"],
  [0.16, 3.7, 0.53, "#D2643A"],
  [0.5, 4.9, 0.084, "#D9A066"],
  [0.42, 6.2, 0.034, "#E8D3A0"],
  [0.3, 7.3, 0.012, "#8FD3E8"],
  [0.3, 8.2, 0.006, "#4F6CD9"],
];

// Animated solar system for science / space explainers: glowing sun, orbiting planets, Saturn's ring, starfield.
export const SolarSystem: React.FC<z.infer<typeof solarSystemSchema>> = ({ title, subtitle, speed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const intro = spring({ frame, fps, config: { damping: 30 } });
  const camDist = (portrait ? 24 : 15) - intro * 2;
  const t = frame * 0.02 * speed;

  return (
    <AbsoluteFill style={{ background: "#02030A" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 45, far: 300 }}>
        <LookCamera position={[0, camDist * 0.42, camDist]} target={[0, 0, 0]} />
        <StarField />
        <ambientLight intensity={0.12} />
        <pointLight position={[0, 0, 0]} intensity={180} decay={1.6} color="#FFF1C9" />
        <mesh>
          <sphereGeometry args={[0.9, 48, 48]} />
          <meshBasicMaterial color="#FFC93C" />
        </mesh>
        <mesh scale={1.35 + Math.sin(frame * 0.1) * 0.03}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial color="#FF9F1C" transparent opacity={0.22} />
        </mesh>
        {PLANETS.map(([r, d, s, color], i) => {
          const a = t * s + i * 1.3;
          const pop = spring({ frame: frame - 8 - i * 4, fps, config: { damping: 14 } });
          return (
            <group key={i}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[d - 0.012, d + 0.012, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.18 * pop} side={THREE.DoubleSide} />
              </mesh>
              <group position={[Math.cos(a) * d, 0, Math.sin(a) * d]} scale={pop}>
                <mesh rotation={[0, frame * 0.05, 0]}>
                  <sphereGeometry args={[r, 32, 32]} />
                  <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
                {i === 5 && (
                  <mesh rotation={[-Math.PI / 2 + 0.45, 0, 0]}>
                    <ringGeometry args={[r * 1.4, r * 2.2, 64]} />
                    <meshStandardMaterial color="#D8C79A" side={THREE.DoubleSide} transparent opacity={0.85} />
                  </mesh>
                )}
              </group>
            </group>
          );
        })}
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: portrait ? "center" : "flex-start", padding: base * 0.07, textAlign: portrait ? "center" : "left" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.085, color: "#fff", opacity: interpolate(frame, [10, 25], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.038, color: "rgba(255,255,255,0.7)", opacity: interpolate(frame, [18, 33], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
