import { noise2D } from "@remotion/noise";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const voxelWorldSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  seed: z.string(),
});

const N = 56; // grid size
const SKY = "#9FD3F5";

const heightAt = (seed: string, x: number, z: number) => {
  const h = noise2D(seed, x / 14, z / 14) * 0.7 + noise2D(`${seed}b`, x / 5, z / 5) * 0.3;
  return Math.max(1, Math.round((h + 1) * 5));
};
const colorFor = (h: number) => (h <= 3 ? "#3E8EDE" : h <= 4 ? "#E8D18B" : h <= 7 ? "#5BAA4A" : h <= 9 ? "#7D7F7D" : "#F4F6F8");

const Terrain: React.FC<{ seed: string }> = ({ seed }) => {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true });
    const m = new THREE.InstancedMesh(geo, mat, N * N);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let x = 0; x < N; x++) {
      for (let z = 0; z < N; z++) {
        const h = heightAt(seed, x, z);
        const top = Math.max(h, 3.4); // flat water surface
        dummy.position.set(x - N / 2, top / 2, z - N / 2);
        dummy.scale.set(1, top, 1);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        m.setColorAt(i, new THREE.Color(colorFor(h)));
        i++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return m;
  }, [seed]);
  return <primitive object={mesh} />;
};

const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { camera } = useThree();
  const t = frame / durationInFrames;
  const z = interpolate(t, [0, 1], [N / 2 + 6, -N / 4]);
  const x = Math.sin(t * Math.PI * 1.5) * 6;
  camera.position.set(x, 16 - t * 3, z);
  camera.lookAt(x * 0.5, 4, z - 18);
  return null;
};

// Voxel world camera fly-through (Minecraft-style terrain from noise). Covers voxel + fly-through styles.
export const VoxelWorld: React.FC<z.infer<typeof voxelWorldSchema>> = ({ title, subtitle, seed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  return (
    <AbsoluteFill style={{ background: SKY }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 60, near: 0.1, far: 200 }}>
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 20, 60]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[20, 40, 10]} intensity={2.2} />
        <Camera />
        <Terrain seed={seed} />
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: base * 0.08, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: "#fff", textShadow: "0 6px 0 rgba(0,0,0,0.25)", opacity: interpolate(frame, [10, 25], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: "#fff", textShadow: "0 3px 0 rgba(0,0,0,0.25)", opacity: interpolate(frame, [20, 35], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
