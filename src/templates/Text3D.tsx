import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { z } from "zod";
import { theme } from "../brand/theme";
import { useTextGeometry } from "../lib/three-text";
import { clamp, useBase } from "../lib/useBase";

export const text3DSchema = z.object({
  // Latin letters/numbers only (for Bangla 3D-looking titles use ExtrudedText).
  text: z.string(),
  subtitle: z.string(),
  faceColor: z.string(),
  sideColor: z.string(),
});

const OrbitCamera: React.FC<{ distance: number }> = ({ distance }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const a = Math.sin(frame * 0.018) * 0.55;
  camera.position.set(Math.sin(a) * distance, 1.2 + Math.sin(frame * 0.01) * 0.5, Math.cos(a) * distance);
  camera.lookAt(0, 0, 0);
  return null;
};

const Letters: React.FC<{ geometry: THREE.ExtrudeGeometry; faceColor: string; sideColor: string; maxWidth: number }> = ({ geometry, faceColor, sideColor, maxWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ExtrudeGeometry has two groups: 0 = front/back caps, 1 = sides & bevel.
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: faceColor, metalness: 0.55, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: sideColor, metalness: 0.4, roughness: 0.4 }),
    ],
    [faceColor, sideColor],
  );
  const box = geometry.boundingBox;
  const w = box ? box.max.x - box.min.x : 100;
  const s = maxWidth / Math.max(w, 1);
  const rise = spring({ frame: frame - 5, fps, config: { damping: 13, mass: 1.2 } });
  return <mesh geometry={geometry} material={materials} scale={[s, -s, s]} position={[0, (1 - rise) * -4, 0]} rotation={[(1 - rise) * 1.2, 0, 0]} />;
};

// Real extruded 3D title / channel logo with bevels, metallic material, colored rim lights and an orbiting camera.
export const Text3D: React.FC<z.infer<typeof text3DSchema>> = ({ text, subtitle, faceColor, sideColor }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const geometry = useTextGeometry(text);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${theme.colors.surface}, #05070D 70%)` }}>
      {geometry && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 40 }}>
          <OrbitCamera distance={10} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[2, 5, 8]} intensity={2.2} />
          <pointLight position={[-6, 2, 3]} intensity={60} color={theme.colors.primary} />
          <pointLight position={[6, -2, 3]} intensity={60} color={theme.colors.secondary} />
          {/* Visible width at distance 10 with a 40° vertical FOV is 7.3 × aspect; keep ~20% margin for the camera swing. */}
          <Letters geometry={geometry} faceColor={faceColor} sideColor={sideColor} maxWidth={Math.min(7.5, 7.3 * (width / height) * 0.8)} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
            <circleGeometry args={[6, 64]} />
            <meshBasicMaterial color={theme.colors.primary} transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: base * 0.1 }}>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: theme.colors.muted, letterSpacing: base * 0.004, opacity: interpolate(frame, [30, 45], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
