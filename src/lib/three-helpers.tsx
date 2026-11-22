import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { random } from "remotion";

// Point the camera somewhere every frame (R3F otherwise aims at the origin).
export const LookCamera: React.FC<{ position: [number, number, number]; target: [number, number, number] }> = ({ position, target }) => {
  const { camera } = useThree();
  camera.position.set(...position);
  camera.lookAt(...target);
  return null;
};

// A sphere of deterministic random stars around the scene.
export const StarField: React.FC<{ count?: number; radius?: number; size?: number }> = ({ count = 1500, radius = 60, size = 0.12 }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = random(`su${i}`) * 2 - 1;
      const t = random(`st${i}`) * Math.PI * 2;
      const r = radius * (0.6 + random(`sr${i}`) * 0.4);
      const s = Math.sqrt(1 - u * u);
      arr.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
    }
    return arr;
  }, [count, radius]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={size} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};
