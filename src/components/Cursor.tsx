import { Easing, interpolate } from "remotion";

export type CursorKey = [frame: number, x: number, y: number];

// Mouse pointer that glides between keyframes [frame, x, y] and dips when clicking.
export const Cursor: React.FC<{ frame: number; keys: CursorKey[]; clicks: number[]; size: number; visibleFrom?: number }> = ({ frame, keys, clicks, size, visibleFrom = 0 }) => {
  let x = keys[0][1];
  let y = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, x0, y0] = keys[i];
    const [f1, x1, y1] = keys[i + 1];
    if (frame >= f0) {
      const t = interpolate(frame, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
      x = x0 + (x1 - x0) * t;
      y = y0 + (y1 - y0) * t;
    }
  }
  const pressed = clicks.some((c) => frame >= c && frame < c + 5);
  const ripple = clicks.map((c) => frame - c).find((d) => d >= 0 && d < 14);
  if (frame < visibleFrom) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {ripple !== undefined && <div style={{ position: "absolute", left: -size * (0.3 + ripple * 0.04), top: -size * (0.3 + ripple * 0.04), width: size * (0.6 + ripple * 0.08), height: size * (0.6 + ripple * 0.08), borderRadius: "50%", border: `${size * 0.05}px solid rgba(255,255,255,${1 - ripple / 14})` }} />}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${pressed ? 0.82 : 1})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.45))" }}>
        <path d="M3 2 L3 19 L7.5 14.5 L10.5 21 L13.5 19.7 L10.6 13.3 L17 13.3 Z" fill="#fff" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
