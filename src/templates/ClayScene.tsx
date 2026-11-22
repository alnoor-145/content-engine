import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const claySceneSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  // Hold each pose for this many frames (2 = classic stop-motion "on twos").
  stepFrames: z.number().int().min(1).max(4),
});

const CLAY = ["#FF8A80", "#FFD54F", "#80D8FF", "#B388FF"];
const FLOOR = "#F3E7D3";

const Blob: React.FC<{ i: number; t: number; jitter: number }> = ({ i, t, jitter }) => {
  const period = 34 + i * 6;
  const phase = ((t + i * 11) % period) / period; // 0..1 bounce cycle
  const air = Math.sin(phase * Math.PI); // 0 on ground, 1 at top
  const y = 0.55 + air * 1.8;
  const squash = phase < 0.08 || phase > 0.92 ? 0.7 : 1 + air * 0.12; // squash on impact, stretch in air
  const x = (i - (CLAY.length - 1) / 2) * 1.6;
  const j = (k: string) => (random(`${k}-${i}-${jitter}`) - 0.5) * 0.04; // "boiling" hand-made wobble
  return (
    <group position={[x + j("x"), 0, j("z")]}>
      <mesh position={[0, y * squash, 0]} scale={[1 / Math.sqrt(squash) + j("s"), squash, 1 / Math.sqrt(squash)]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial color={CLAY[i]} roughness={0.95} metalness={0} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.17, y * squash + 0.12, 0.48]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      <mesh position={[0.17, y * squash + 0.12, 0.48]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      {/* fake contact shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 - air * 0.5, 1 - air * 0.5, 1]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18 - air * 0.1} />
      </mesh>
    </group>
  );
};

// Aim the camera at the characters (not the floor origin) so they sit in the middle of the frame.
const Camera: React.FC<{ z: number }> = ({ z }) => {
  const { camera } = useThree();
  camera.position.set(0, 2.4, z);
  camera.lookAt(0, 1.1, 0);
  return null;
};

// Claymation look: soft matte clay characters bounce with squash & stretch, animated on twos with
// hand-made "boil" jitter. Covers the claymation and stop-motion styles.
export const ClayScene: React.FC<z.infer<typeof claySceneSchema>> = ({ title, subtitle, stepFrames }) => {
  const raw = useCurrentFrame();
  const t = raw - (raw % stepFrames);
  const { width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  return (
    <AbsoluteFill style={{ background: FLOOR }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40 }}>
        <Camera z={portrait ? 12 : 8} />
        <color attach="background" args={["#FBE9D0"]} />
        <hemisphereLight args={["#FFF4E0", "#C9B79C", 1.2]} />
        <directionalLight position={[3, 6, 5]} intensity={1.6} />
        <group rotation={[-0.05, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color={FLOOR} roughness={1} />
          </mesh>
          {CLAY.map((_, i) => (
            <Blob key={i} i={i} t={t} jitter={t} />
          ))}
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: base * 0.08, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: "#6B4F3A", textShadow: "0 5px 0 #E2C9A6, 0 8px 12px rgba(0,0,0,0.15)", transform: `rotate(${(random(`r${t}`) - 0.5) * 1.2}deg)`, opacity: interpolate(raw, [6, 18], [0, 1], clamp) }}>
          {title}
        </div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: "#8A6E57" }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
