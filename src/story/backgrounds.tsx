import { Birds, Boat, Butterflies, Car, Clouds, Fireflies, Grass, Ground, Hills, House, Rain, River, Sky, Tree, type Env } from "./nature";

export const BACKGROUNDS = ["village", "river", "road", "field", "night"] as const;
export const EXTRAS = ["birds", "butterflies", "smoke", "boat", "car", "fireflies", "rain"] as const;
export type Background = (typeof BACKGROUNDS)[number];
export type Extra = (typeof EXTRAS)[number];

// Each layer gets its own parallax depth (0 = fixed sky … 1 = the ground the characters stand on).
export type Layers = { sky: React.ReactNode; far: React.ReactNode; mid: React.ReactNode; near: React.ReactNode; fore: React.ReactNode };
export const DEPTH = { sky: 0.08, far: 0.35, mid: 0.75, near: 1, fore: 1.18 };

const FarTrees: React.FC<{ e: Env; y: number }> = ({ e, y }) => (
  <g>
    {Array.from({ length: 16 }).map((_, i) => (
      <Tree key={i} e={e} x={-0.35 * e.w + i * e.w * 0.115} y={y} size={e.base * (0.1 + (i % 3) * 0.03)} kind={i % 4 === 1 ? "palm" : "round"} i={i + 40} />
    ))}
  </g>
);

export const buildLayers = (bg: Background, e: Env, extras: Extra[], tl: number, dur: number): Layers => {
  const has = (x: Extra) => extras.includes(x);
  const sky = (
    <g>
      <Sky e={e} />
      <Clouds e={e} />
      {has("birds") && e.time !== "night" && <Birds e={e} />}
    </g>
  );
  const fore = (
    <g>
      <Grass e={e} y={e.h * 1.02} count={26} scale={2.6} />
      {has("rain") && <Rain e={e} />}
      {has("fireflies") && <Fireflies e={e} />}
      {has("butterflies") && e.time !== "night" && <Butterflies e={e} />}
    </g>
  );

  if (bg === "river") {
    const top = e.horizonY + e.base * 0.03;
    const bottom = e.groundY - e.base * 0.05;
    const boatX = e.w * (0.1 + 0.6 * Math.min(1, tl / Math.max(dur, 1)));
    return {
      sky,
      far: (
        <g>
          <Hills e={e} layer={0} />
          <rect x={-0.4 * e.w} y={e.horizonY - e.base * 0.01} width={e.w * 1.8} height={e.base * 0.05} fill={e.time === "night" ? "#1A3324" : "#6FAE5E"} />
          <FarTrees e={e} y={e.horizonY + e.base * 0.03} />
        </g>
      ),
      mid: (
        <g>
          <River e={e} top={top} bottom={bottom} />
          {has("boat") && <Boat e={e} x={boatX} y={(top + bottom) / 2 + e.base * 0.02} size={e.base * 0.32} />}
        </g>
      ),
      near: (
        <g>
          <path d={`M ${-0.4 * e.w} ${bottom + e.base * 0.01} Q ${e.w * 0.5} ${bottom - e.base * 0.03} ${1.4 * e.w} ${bottom + e.base * 0.01} L ${1.4 * e.w} ${e.h * 1.3} L ${-0.4 * e.w} ${e.h * 1.3} Z`} fill={e.time === "night" ? "#1E3A2A" : "#7DBA4F"} />
          <path d={`M ${-0.4 * e.w} ${bottom + e.base * 0.01} Q ${e.w * 0.5} ${bottom - e.base * 0.03} ${1.4 * e.w} ${bottom + e.base * 0.01}`} stroke={e.time === "night" ? "#2A2A20" : "#C9B98F"} strokeWidth={e.base * 0.02} fill="none" />
          <Tree e={e} x={e.w * 1.08} y={e.groundY + e.base * 0.02} size={e.base * 0.5} kind="palm" i={3} />
          <Tree e={e} x={-e.w * 0.1} y={e.groundY + e.base * 0.03} size={e.base * 0.42} kind="round" i={4} />
          <Grass e={e} y={e.groundY + e.base * 0.08} />
        </g>
      ),
      fore,
    };
  }

  if (bg === "road") {
    const roadTop = e.groundY - e.base * 0.16;
    const roadBottom = e.groundY - e.base * 0.05;
    const period = 6;
    const k = (tl % period) / period;
    const carX = -0.35 * e.w + k * 1.7 * e.w;
    return {
      sky,
      far: (
        <g>
          <Hills e={e} layer={0} />
          <Hills e={e} layer={1} />
          <FarTrees e={e} y={e.horizonY + e.base * 0.025} />
        </g>
      ),
      mid: (
        <g>
          <Ground e={e} path={false} />
          <House e={e} x={e.w * 0.08} y={roadTop - e.base * 0.01} size={e.base * 0.26} roof="#9AA5B1" i={1} smoke={has("smoke")} />
          <Tree e={e} x={e.w * 0.3} y={roadTop - e.base * 0.005} size={e.base * 0.3} kind="round" i={5} />
          <House e={e} x={e.w * 0.9} y={roadTop - e.base * 0.01} size={e.base * 0.24} roof="#B5652E" i={2} />
          <rect x={-0.4 * e.w} y={roadTop} width={e.w * 1.8} height={roadBottom - roadTop} fill={e.time === "night" ? "#22252E" : "#55595F"} />
          <line x1={-0.4 * e.w} y1={(roadTop + roadBottom) / 2} x2={1.4 * e.w} y2={(roadTop + roadBottom) / 2} stroke="#F2E6B8" strokeWidth={e.base * 0.005} strokeDasharray={`${e.base * 0.05} ${e.base * 0.04}`} />
          {has("car") && <Car e={e} x={carX} y={roadBottom - e.base * 0.025} size={e.base * 0.34} color="#E5484D" dir={1} />}
          {has("car") && <Car e={e} x={1.35 * e.w - ((tl + 2.7) % period) / period * 1.7 * e.w} y={roadTop + e.base * 0.05} size={e.base * 0.28} color="#2F6BFF" dir={-1} />}
        </g>
      ),
      near: (
        <g>
          <rect x={-0.4 * e.w} y={roadBottom} width={e.w * 1.8} height={e.base * 0.025} fill={e.time === "night" ? "#4A4A4A" : "#BDB6A8"} />
          <rect x={-0.4 * e.w} y={roadBottom + e.base * 0.025} width={e.w * 1.8} height={e.h} fill={e.time === "night" ? "#1E3A2A" : "#7DBA4F"} />
          <Grass e={e} y={e.groundY + e.base * 0.08} />
        </g>
      ),
      fore,
    };
  }

  if (bg === "field") {
    return {
      sky,
      far: (
        <g>
          <Hills e={e} layer={0} />
          <FarTrees e={e} y={e.horizonY + e.base * 0.03} />
        </g>
      ),
      mid: (
        <g>
          <Ground e={e} path={false} />
          {Array.from({ length: 14 }).map((_, i) => {
            const y = e.horizonY + e.base * 0.04 + Math.pow(i / 14, 1.6) * (e.groundY - e.horizonY);
            return <line key={i} x1={-0.4 * e.w} y1={y} x2={1.4 * e.w} y2={y} stroke={e.time === "night" ? "#244A30" : i % 2 ? "#9CCB5C" : "#5E9E3E"} strokeWidth={e.base * (0.004 + i * 0.0012)} />;
          })}
          <Tree e={e} x={e.w * 0.86} y={e.groundY - e.base * 0.04} size={e.base * 0.55} kind="round" i={7} />
        </g>
      ),
      near: <Grass e={e} y={e.groundY + e.base * 0.08} count={60} />,
      fore,
    };
  }

  // village (also used for "night")
  return {
    sky,
    far: (
      <g>
        <Hills e={e} layer={0} />
        <Hills e={e} layer={1} />
        <FarTrees e={e} y={e.horizonY + e.base * 0.03} />
      </g>
    ),
    mid: (
      <g>
        <Ground e={e} />
        <Tree e={e} x={-e.w * 0.12} y={e.groundY - e.base * 0.06} size={e.base * 0.55} kind="round" i={1} />
        <House e={e} x={e.w * 0.13} y={e.groundY - e.base * 0.07} size={e.base * 0.34} roof="#9AA5B1" smoke={has("smoke")} i={1} />
        <Tree e={e} x={e.w * 0.42} y={e.groundY - e.base * 0.09} size={e.base * 0.42} kind="palm" i={2} />
        <Tree e={e} x={e.w * 0.62} y={e.groundY - e.base * 0.09} size={e.base * 0.3} kind="banana" i={3} />
        <House e={e} x={e.w * 0.86} y={e.groundY - e.base * 0.07} size={e.base * 0.3} roof="#B5652E" i={2} />
        <Tree e={e} x={e.w * 1.12} y={e.groundY - e.base * 0.06} size={e.base * 0.5} kind="round" i={4} />
      </g>
    ),
    near: <Grass e={e} y={e.groundY + e.base * 0.08} />,
    fore,
  };
};
