import { geoDistance, geoInterpolate } from "d3-geo";

export type Cam = { center: [number, number]; scale: number };

// "Flight" between two map cameras: centre moves along the great circle, zoom eases in log space
// and pulls out mid-way when the two places are far apart (like Google Earth).
export const fly = (a: Cam, b: Cam, t: number): Cam => {
  const center = geoInterpolate(a.center, b.center)(t) as [number, number];
  const far = Math.min(1, geoDistance(a.center, b.center) / 0.25);
  const ls = Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * t - 0.9 * far * Math.sin(Math.PI * t);
  return { center, scale: Math.exp(ls) };
};

// Mercator scale that shows roughly `km` kilometres across a frame `w` px wide.
export const scaleForKm = (w: number, km: number) => (w * 6371) / km;

export const Pin: React.FC<{ x: number; y: number; color: string; size: number; drop: number; label?: string; labelColor?: string; font?: string }> = ({ x, y, color, size, drop, label, labelColor = "#fff", font }) => (
  <g transform={`translate(${x} ${y - (1 - drop) * size * 3})`} opacity={Math.min(1, drop * 2)}>
    <ellipse cx={0} cy={(1 - drop) * size * 3} rx={size * 0.25} ry={size * 0.1} fill="rgba(0,0,0,0.3)" />
    <g transform={`scale(${size / 20})`}>
      <path d="M0 0 C -5 -9 -10 -13 -10 -20 A 10 10 0 1 1 10 -20 C 10 -13 5 -9 0 0 Z" fill={color} stroke="#fff" strokeWidth={1.6} />
      <circle cx={0} cy={-20} r={4} fill="#fff" />
    </g>
    {label && (
      <text x={0} y={size * 0.55} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size * 0.55} fill={labelColor} stroke="rgba(0,0,0,0.55)" strokeWidth={size * 0.12} paintOrder="stroke">
        {label}
      </text>
    )}
  </g>
);
