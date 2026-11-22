import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const threeDHeroSchema = z.object({
  title: z.string(),
  shape: z.enum(["torusKnot", "icosahedron", "box"]),
  flatShading: z.boolean(),
});

// 3D hero object (React Three Fiber via @remotion/three) spinning behind a title.
export const ThreeDHero: React.FC<z.infer<typeof threeDHeroSchema>> = ({ title, shape, flatShading }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const rot = frame * 0.02;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle, ${theme.colors.surface}, ${theme.colors.background})` }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={2} color={theme.colors.secondary} />
        <pointLight position={[-4, -2, 3]} intensity={30} color={theme.colors.primary} />
        <mesh rotation={[rot * 0.6, rot, 0]} scale={pop * (width > height ? 1.1 : 0.9)}>
          {shape === "torusKnot" && <torusKnotGeometry args={[1, 0.35, 220, 32]} />}
          {shape === "icosahedron" && <icosahedronGeometry args={[1.5, flatShading ? 1 : 6]} />}
          {shape === "box" && <boxGeometry args={[2, 2, 2]} />}
          <meshStandardMaterial color={theme.colors.text} metalness={0.6} roughness={0.25} flatShading={flatShading} />
        </mesh>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: base * 0.1 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.09, color: theme.colors.text, opacity: interpolate(frame, [20, 40], [0, 1], clamp) }}>{title}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
