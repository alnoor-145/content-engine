import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const globeSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  markers: z.array(z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) })),
  connect: z.boolean(),
});

const R = 1.6;
const toXYZ = (lat: number, lon: number, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

const Arc: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; progress: number }> = ({ a, b, progress }) => {
  const geometry = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.setLength(R + a.distanceTo(b) * 0.45);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 64, 0.012, 8, false);
  }, [a, b]);
  const count = geometry.index ? geometry.index.count : 0;
  geometry.setDrawRange(0, Math.floor((count * progress) / 6) * 6);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={theme.colors.accent} />
    </mesh>
  );
};

// Rotating tech globe with glowing location markers and flight-path arcs. For news, travel, geopolitics.
export const Globe: React.FC<z.infer<typeof globeSchema>> = ({ title, subtitle, markers, connect }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const points = useMemo(() => markers.map((m) => toXYZ(m.lat, m.lon)), [markers]);
  const portrait = height > width;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #13203A, ${theme.colors.background})` }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, portrait ? 7.5 : 5.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 3, 5]} intensity={1.5} />
        <group rotation={[0.35, frame * 0.008 - 1.2, 0]} scale={0.7 + 0.3 * enter}>
          <mesh>
            <sphereGeometry args={[R * 0.99, 64, 64]} />
            <meshStandardMaterial color="#0D1B33" roughness={0.9} />
          </mesh>
          <mesh>
            <sphereGeometry args={[R, 36, 24]} />
            <meshBasicMaterial color={theme.colors.secondary} wireframe transparent opacity={0.22} />
          </mesh>
          {points.map((p, i) => {
            const pop = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 10 } });
            const pulse = 1 + 0.6 * ((frame * 0.05 + i * 0.3) % 1);
            return (
              <group key={i} position={p}>
                <mesh scale={pop}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color={theme.colors.primary} />
                </mesh>
                <mesh scale={pop * pulse}>
                  <sphereGeometry args={[0.07, 16, 16]} />
                  <meshBasicMaterial color={theme.colors.primary} transparent opacity={Math.max(0, 0.5 - (pulse - 1) * 0.8)} />
                </mesh>
              </group>
            );
          })}
          {connect &&
            points.slice(1).map((p, i) => (
              <Arc key={i} a={points[i]} b={p} progress={interpolate(frame, [30 + i * 15, 60 + i * 15], [0, 1], clamp)} />
            ))}
        </group>
        <mesh>
          <sphereGeometry args={[R * 1.12, 48, 48]} />
          <meshBasicMaterial color={theme.colors.secondary} transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: portrait ? "flex-start" : "flex-end", alignItems: "center", padding: base * 0.08, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: theme.colors.text, opacity: interpolate(frame, [10, 30], [0, 1], clamp) }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted, opacity: interpolate(frame, [20, 40], [0, 1], clamp) }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
