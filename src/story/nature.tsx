import { random } from "remotion";

// Shared scene context. All sizes are pixels; drawings span x ∈ [-0.4w, 1.4w] so the camera can pan/zoom.
export type Env = {
  w: number;
  h: number;
  base: number;
  f: number; // absolute frame (for continuous motion)
  tl: number; // seconds since the scene started
  horizonY: number;
  groundY: number;
  time: "day" | "sunset" | "night";
  seed: string;
};

const X0 = (e: Env) => -0.4 * e.w;
const X1 = (e: Env) => 1.4 * e.w;
const rnd = (e: Env, k: string) => random(`${e.seed}-${k}`);

const SKY = {
  day: ["#6EC1F0", "#BFE6FB", "#E9F7FF"],
  sunset: ["#3E2C6E", "#E0705A", "#FFC487"],
  night: ["#050A22", "#121A47", "#26306A"],
};

export const Sky: React.FC<{ e: Env }> = ({ e }) => {
  const [a, b, c] = SKY[e.time];
  const id = `sky-${e.time}`;
  const sunX = e.time === "sunset" ? e.w * 0.72 : e.w * 0.8;
  const sunY = e.time === "sunset" ? e.horizonY - e.base * 0.03 : e.h * 0.15;
  const sunR = e.base * (e.time === "sunset" ? 0.1 : 0.065);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="60%" stopColor={b} />
          <stop offset="100%" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor={e.time === "night" ? "#FFFBE6" : "#FFE08A"} stopOpacity={0.6} />
          <stop offset="100%" stopColor="#FFE08A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={X0(e)} y={-e.h * 0.2} width={X1(e) - X0(e)} height={e.horizonY + e.h * 0.4} fill={`url(#${id})`} />
      {e.time === "night" ? (
        <g>
          {Array.from({ length: 90 }).map((_, i) => (
            <circle key={i} cx={X0(e) + rnd(e, `sx${i}`) * (X1(e) - X0(e))} cy={rnd(e, `sy${i}`) * e.horizonY * 0.85} r={e.base * (0.0012 + rnd(e, `sr${i}`) * 0.0022)} fill="#fff" opacity={0.35 + 0.65 * Math.abs(Math.sin(e.f * 0.04 + i * 1.7))} />
          ))}
          <circle cx={e.w * 0.8} cy={e.h * 0.15} r={e.base * 0.16} fill={`url(#${id}-glow)`} />
          <mask id={`${id}-moon`}>
            <rect x={0} y={0} width={e.w * 2} height={e.h} fill="#fff" />
            <circle cx={e.w * 0.8 + e.base * 0.03} cy={e.h * 0.15 - e.base * 0.012} r={e.base * 0.052} fill="#000" />
          </mask>
          <circle cx={e.w * 0.8} cy={e.h * 0.15} r={e.base * 0.055} fill="#FFF6D5" mask={`url(#${id}-moon)`} />
        </g>
      ) : (
        <g>
          <circle cx={sunX} cy={sunY} r={sunR * 2.6} fill={`url(#${id}-glow)`} />
          <g transform={`rotate(${e.f * 0.3} ${sunX} ${sunY})`} opacity={e.time === "day" ? 0.5 : 0.25}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={sunX - sunR * 0.08} y={sunY - sunR * 1.9} width={sunR * 0.16} height={sunR * 0.55} rx={sunR * 0.08} fill="#FFE27A" transform={`rotate(${i * 30} ${sunX} ${sunY})`} />
            ))}
          </g>
          <circle cx={sunX} cy={sunY} r={sunR} fill={e.time === "sunset" ? "#FF8A3D" : "#FFD23F"} />
        </g>
      )}
    </g>
  );
};

export const Clouds: React.FC<{ e: Env; count?: number }> = ({ e, count = 6 }) => {
  const span = X1(e) - X0(e);
  const color = e.time === "night" ? "rgba(140,150,200,0.25)" : e.time === "sunset" ? "rgba(255,210,190,0.85)" : "rgba(255,255,255,0.95)";
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const s = e.base * (0.08 + rnd(e, `cs${i}`) * 0.08);
        const x = X0(e) + ((rnd(e, `cx${i}`) * span + e.f * e.base * 0.0007 * (1 + (i % 3))) % span);
        const y = e.h * 0.06 + rnd(e, `cy${i}`) * e.horizonY * 0.4;
        return (
          <g key={i} fill={color}>
            <ellipse cx={x} cy={y} rx={s * 1.6} ry={s * 0.55} />
            <circle cx={x - s * 0.6} cy={y - s * 0.2} r={s * 0.55} />
            <circle cx={x + s * 0.2} cy={y - s * 0.45} r={s * 0.72} />
            <circle cx={x + s * 0.85} cy={y - s * 0.1} r={s * 0.5} />
          </g>
        );
      })}
    </g>
  );
};

export const Hills: React.FC<{ e: Env; layer: 0 | 1 }> = ({ e, layer }) => {
  const colors = { day: ["#9BCB8B", "#79B567"], sunset: ["#8A6A8E", "#6C5277"], night: ["#1B2A45", "#142036"] }[e.time];
  const amp = e.base * (layer === 0 ? 0.11 : 0.06);
  const yb = e.horizonY + (layer === 0 ? 0 : e.base * 0.03);
  const pts: string[] = [];
  for (let x = X0(e); x <= X1(e) + 1; x += e.w / 24) {
    const y = yb - amp * (0.55 + 0.45 * Math.sin(x / (e.w * (layer ? 0.17 : 0.27)) + (layer ? 2 : 0.5))) - amp * 0.25 * Math.sin(x / (e.w * 0.07));
    pts.push(`${pts.length ? "L" : "M"}${x} ${y}`);
  }
  return <path d={`${pts.join(" ")} L ${X1(e)} ${e.groundY} L ${X0(e)} ${e.groundY} Z`} fill={colors[layer]} />;
};

// Ground strip from the horizon down, with a lighter dirt path.
export const Ground: React.FC<{ e: Env; path?: boolean }> = ({ e, path = true }) => {
  const g = { day: ["#7DBA4F", "#68A63F"], sunset: ["#7F8F45", "#6A7A3A"], night: ["#1E3A2A", "#16301F"] }[e.time];
  return (
    <g>
      <rect x={X0(e)} y={e.horizonY + e.base * 0.02} width={X1(e) - X0(e)} height={e.h} fill={g[0]} />
      <rect x={X0(e)} y={e.groundY + e.base * 0.06} width={X1(e) - X0(e)} height={e.h} fill={g[1]} />
      {path && <path d={`M ${X0(e)} ${e.groundY + e.base * 0.02} Q ${e.w * 0.5} ${e.groundY - e.base * 0.03} ${X1(e)} ${e.groundY + e.base * 0.02} L ${X1(e)} ${e.groundY + e.base * 0.09} Q ${e.w * 0.5} ${e.groundY + e.base * 0.05} ${X0(e)} ${e.groundY + e.base * 0.09} Z`} fill={e.time === "night" ? "#3A3428" : "#D8C49A"} opacity={0.85} />}
    </g>
  );
};

// Swaying grass tufts along a line.
export const Grass: React.FC<{ e: Env; y: number; count?: number; scale?: number }> = ({ e, y, count = 40, scale = 1 }) => {
  const c = e.time === "night" ? "#2C5238" : "#4E9A3A";
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const x = X0(e) + rnd(e, `g${i}${y}`) * (X1(e) - X0(e));
        const s = e.base * 0.022 * scale * (0.7 + rnd(e, `gs${i}`) * 0.6);
        const sway = Math.sin(e.f * 0.08 + i) * s * 0.25;
        return <path key={i} d={`M ${x - s * 0.4} ${y} Q ${x - s * 0.3 + sway} ${y - s * 0.6} ${x - s * 0.5 + sway} ${y - s} M ${x} ${y} Q ${x + sway} ${y - s * 0.8} ${x + sway * 1.2} ${y - s * 1.3} M ${x + s * 0.4} ${y} Q ${x + s * 0.4 + sway} ${y - s * 0.6} ${x + s * 0.6 + sway} ${y - s * 0.9}`} stroke={c} strokeWidth={s * 0.14} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Trees sway in the wind around their base.
export const Tree: React.FC<{ e: Env; x: number; y: number; size: number; kind: "round" | "palm" | "banana"; i: number }> = ({ e, x, y, size, kind, i }) => {
  const sway = Math.sin(e.f * 0.045 + i * 1.3) * (kind === "palm" ? 3 : 1.8);
  const dark = e.time === "night";
  const leaf = dark ? ["#1F4A2A", "#2A5C34"] : ["#3E8E3A", "#5DB04C"];
  const trunk = dark ? "#3A2A1E" : "#7A4E2D";
  if (kind === "palm") {
    const topX = x + size * 0.25;
    const topY = y - size * 1.25;
    return (
      <g transform={`rotate(${sway * 0.4} ${x} ${y})`}>
        <path d={`M ${x - size * 0.05} ${y} Q ${x + size * 0.05} ${y - size * 0.7} ${topX} ${topY} L ${topX + size * 0.06} ${topY + size * 0.02} Q ${x + size * 0.13} ${y - size * 0.7} ${x + size * 0.07} ${y} Z`} fill={trunk} />
        <g transform={`rotate(${sway} ${topX} ${topY})`}>
          {Array.from({ length: 7 }).map((_, k) => {
            const a = -170 + k * 30 + Math.sin(e.f * 0.07 + k) * 3;
            const rad = (a * Math.PI) / 180;
            const ex = topX + Math.cos(rad) * size * 0.62;
            const ey = topY + Math.sin(rad) * size * 0.3 + size * 0.22;
            return <path key={k} d={`M ${topX} ${topY} Q ${topX + Math.cos(rad) * size * 0.35} ${topY + Math.sin(rad) * size * 0.35 - size * 0.12} ${ex} ${ey}`} stroke={leaf[k % 2]} strokeWidth={size * 0.09} fill="none" strokeLinecap="round" />;
          })}
          <circle cx={topX - size * 0.03} cy={topY + size * 0.06} r={size * 0.05} fill={dark ? "#3A3A1E" : "#6B5A2A"} />
          <circle cx={topX + size * 0.05} cy={topY + size * 0.07} r={size * 0.05} fill={dark ? "#3A3A1E" : "#7A6A2E"} />
        </g>
      </g>
    );
  }
  if (kind === "banana") {
    return (
      <g transform={`rotate(${sway * 0.6} ${x} ${y})`}>
        <rect x={x - size * 0.05} y={y - size * 0.6} width={size * 0.1} height={size * 0.6} fill={dark ? "#2E4A2A" : "#7FA85A"} />
        {Array.from({ length: 5 }).map((_, k) => (
          <ellipse key={k} cx={x + (k - 2) * size * 0.14} cy={y - size * 0.72 + Math.abs(k - 2) * size * 0.06} rx={size * 0.09} ry={size * 0.32} fill={leaf[k % 2]} transform={`rotate(${(k - 2) * 28 + Math.sin(e.f * 0.06 + k) * 4} ${x} ${y - size * 0.6})`} />
        ))}
      </g>
    );
  }
  return (
    <g transform={`rotate(${sway} ${x} ${y})`}>
      <rect x={x - size * 0.06} y={y - size * 0.55} width={size * 0.12} height={size * 0.55} rx={size * 0.03} fill={trunk} />
      <circle cx={x} cy={y - size * 0.8} r={size * 0.36} fill={leaf[0]} />
      <circle cx={x - size * 0.25} cy={y - size * 0.62} r={size * 0.26} fill={leaf[0]} />
      <circle cx={x + size * 0.27} cy={y - size * 0.64} r={size * 0.27} fill={leaf[0]} />
      <circle cx={x - size * 0.08} cy={y - size * 0.92} r={size * 0.2} fill={leaf[1]} opacity={0.9} />
      <circle cx={x + size * 0.14} cy={y - size * 0.72} r={size * 0.14} fill={leaf[1]} opacity={0.8} />
    </g>
  );
};

// Village house: mud walls, corrugated tin roof, door, window (lit at night) and kitchen smoke.
export const House: React.FC<{ e: Env; x: number; y: number; size: number; roof: string; smoke?: boolean; i: number }> = ({ e, x, y, size, roof, smoke, i }) => {
  const dark = e.time === "night";
  const wall = dark ? "#4A3A2E" : "#C98E5B";
  const w = size;
  const hh = size * 0.5;
  return (
    <g>
      {smoke &&
        Array.from({ length: 6 }).map((_, k) => {
          const p = ((e.f * 0.012 + k / 6 + i * 0.3) % 1);
          return <circle key={k} cx={x + w * 0.3 + Math.sin(p * 6 + k) * w * 0.06 + p * w * 0.15} cy={y - hh - w * 0.35 - p * w * 0.9} r={w * (0.05 + p * 0.12)} fill={dark ? "#8890A8" : "#E8E8E8"} opacity={(1 - p) * 0.55} />;
        })}
      <rect x={x - w / 2} y={y - hh} width={w} height={hh} fill={wall} />
      <path d={`M ${x - w * 0.6} ${y - hh} L ${x - w * 0.42} ${y - hh - w * 0.32} L ${x + w * 0.42} ${y - hh - w * 0.32} L ${x + w * 0.6} ${y - hh} Z`} fill={dark ? "#3E4552" : roof} />
      {Array.from({ length: 9 }).map((_, k) => (
        <line key={k} x1={x - w * 0.55 + k * w * 0.137} y1={y - hh} x2={x - w * 0.4 + k * w * 0.1} y2={y - hh - w * 0.31} stroke="rgba(0,0,0,0.15)" strokeWidth={w * 0.01} />
      ))}
      <rect x={x - w * 0.12} y={y - hh * 0.75} width={w * 0.2} height={hh * 0.75} fill={dark ? "#2A1E16" : "#6B4226"} />
      <rect x={x + w * 0.18} y={y - hh * 0.72} width={w * 0.18} height={hh * 0.32} fill={dark ? "#FFD36B" : "#5A7FA0"} stroke={dark ? "#FFB84D" : "#4A3020"} strokeWidth={w * 0.015} />
      {dark && (
        <>
          <defs>
            <radialGradient id={`win-glow-${i}`}>
              <stop offset="0%" stopColor="#FFD36B" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#FFD36B" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={x + w * 0.27} cy={y - hh * 0.56} r={w * 0.32} fill={`url(#win-glow-${i})`} />
        </>
      )}
    </g>
  );
};

// River band with moving wave lines and sparkles.
export const River: React.FC<{ e: Env; top: number; bottom: number }> = ({ e, top, bottom }) => {
  const dark = e.time === "night";
  const c = dark ? ["#13284A", "#0D1F3B"] : e.time === "sunset" ? ["#B97A7A", "#7E5A7A"] : ["#5EA8DD", "#3F86C2"];
  const bandH = bottom - top;
  return (
    <g>
      <defs>
        <linearGradient id={`river-${e.time}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c[0]} />
          <stop offset="100%" stopColor={c[1]} />
        </linearGradient>
      </defs>
      <rect x={X0(e)} y={top} width={X1(e) - X0(e)} height={bandH} fill={`url(#river-${e.time})`} />
      {Array.from({ length: 7 }).map((_, k) => {
        const y = top + ((k + 0.5) / 7) * bandH;
        const pts: string[] = [];
        for (let x = X0(e); x <= X1(e); x += e.w / 40) pts.push(`${pts.length ? "L" : "M"}${x} ${y + Math.sin(x / (e.base * 0.06) + e.f * 0.08 * (1 + k * 0.15) + k) * e.base * 0.004}`);
        return <path key={k} d={pts.join(" ")} stroke="rgba(255,255,255,0.22)" strokeWidth={e.base * 0.003} fill="none" strokeDasharray={`${e.base * 0.05} ${e.base * 0.04}`} strokeDashoffset={-e.f * e.base * 0.002 * (k % 2 ? 1 : -1)} />;
      })}
      {Array.from({ length: 18 }).map((_, k) => (
        <circle key={`s${k}`} cx={X0(e) + rnd(e, `rs${k}`) * (X1(e) - X0(e))} cy={top + rnd(e, `ry${k}`) * bandH} r={e.base * 0.003} fill="#fff" opacity={Math.max(0, Math.sin(e.f * 0.15 + k * 2.1)) * 0.7} />
      ))}
    </g>
  );
};

// Bangladeshi country boat with a curved bamboo-mat roof (chhoi) and a rower.
export const Boat: React.FC<{ e: Env; x: number; y: number; size: number }> = ({ e, x, y, size }) => {
  const bob = Math.sin(e.f * 0.08) * size * 0.03;
  const tilt = Math.sin(e.f * 0.06) * 2.5;
  const row = Math.sin(e.f * 0.12);
  const dark = e.time === "night";
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${tilt})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.7} ry={size * 0.06} fill="rgba(255,255,255,0.25)" />
      <path d={`M ${-size * 0.62} ${-size * 0.18} Q 0 ${size * 0.16} ${size * 0.62} ${-size * 0.18} Q ${size * 0.4} ${size * 0.05} 0 ${size * 0.06} Q ${-size * 0.4} ${size * 0.05} ${-size * 0.62} ${-size * 0.18} Z`} fill={dark ? "#3A2618" : "#7A4A2A"} />
      <path d={`M ${-size * 0.5} ${-size * 0.08} Q 0 ${size * 0.07} ${size * 0.5} ${-size * 0.08}`} stroke={dark ? "#4A3424" : "#9A6A3E"} strokeWidth={size * 0.025} fill="none" />
      <path d={`M ${-size * 0.22} ${-size * 0.05} Q ${-size * 0.05} ${-size * 0.42} ${size * 0.22} ${-size * 0.05} Z`} fill={dark ? "#5A4A30" : "#C8A26B"} />
      {Array.from({ length: 4 }).map((_, k) => <path key={k} d={`M ${-size * 0.16 + k * size * 0.1} ${-size * 0.08} Q ${-size * 0.05 + k * size * 0.06} ${-size * 0.32} ${-size * 0.02 + k * size * 0.07} ${-size * 0.3}`} stroke="rgba(0,0,0,0.15)" strokeWidth={size * 0.01} fill="none" />)}
      {/* rower */}
      <g transform={`translate(${size * 0.38} ${-size * 0.14})`}>
        <rect x={-size * 0.035} y={-size * 0.2} width={size * 0.07} height={size * 0.17} rx={size * 0.03} fill={dark ? "#5A6A8A" : "#E0E0E0"} />
        <circle cx={0} cy={-size * 0.25} r={size * 0.045} fill={dark ? "#6A4A34" : "#B9824F"} />
        <line x1={0} y1={-size * 0.14} x2={size * 0.05 + row * size * 0.12} y2={size * 0.22} stroke={dark ? "#3A2618" : "#5A3A20"} strokeWidth={size * 0.022} strokeLinecap="round" />
      </g>
    </g>
  );
};

// Flock of birds in a V, flapping across the sky.
export const Birds: React.FC<{ e: Env; count?: number }> = ({ e, count = 6 }) => {
  const span = X1(e) - X0(e);
  const lead = X0(e) + ((e.tl * e.base * 0.12 + rnd(e, "bx") * span) % span);
  const y0 = e.h * 0.18 + rnd(e, "by") * e.horizonY * 0.2;
  const s = e.base * 0.022;
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1);
        const x = lead - Math.abs(k) * s * 2.2;
        const y = y0 + k * s * 1.3 + Math.sin(e.f * 0.07 + i) * s * 0.3;
        const flap = Math.sin(e.f * 0.5 + i * 0.8) * s * 0.9;
        return <path key={i} d={`M ${x - s} ${y - flap * 0.3} Q ${x - s * 0.5} ${y - flap} ${x} ${y} Q ${x + s * 0.5} ${y - flap} ${x + s} ${y - flap * 0.3}`} stroke={e.time === "sunset" ? "#2A1A2E" : "#26323F"} strokeWidth={s * 0.16} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Fluttering butterflies on wandering paths.
export const Butterflies: React.FC<{ e: Env; count?: number }> = ({ e, count = 3 }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = e.w * (0.2 + 0.6 * ((rnd(e, `bf${i}`) + e.tl * 0.03 * (i % 2 ? 1 : -1) + 1) % 1)) + Math.sin(e.tl * 1.3 + i) * e.base * 0.05;
      const y = e.groundY - e.base * (0.12 + 0.12 * rnd(e, `bg${i}`)) + Math.sin(e.tl * 2.1 + i * 2) * e.base * 0.03;
      const flap = Math.abs(Math.sin(e.f * 0.6 + i));
      const s = e.base * 0.012;
      const col = ["#FF8FB1", "#FFD23F", "#9B6BFF"][i % 3];
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cx={-s * 0.6 * flap} cy={0} rx={s * flap} ry={s * 0.8} fill={col} />
          <ellipse cx={s * 0.6 * flap} cy={0} rx={s * flap} ry={s * 0.8} fill={col} />
          <rect x={-s * 0.1} y={-s * 0.6} width={s * 0.2} height={s * 1.2} fill="#333" />
        </g>
      );
    })}
  </g>
);

// Side-view car: body bounce, spinning wheels, headlights at night.
export const Car: React.FC<{ e: Env; x: number; y: number; size: number; color: string; dir: 1 | -1 }> = ({ e, x, y, size, color, dir }) => {
  const bounce = Math.abs(Math.sin(e.f * 0.5)) * size * 0.012;
  const spin = (x / (size * 0.18)) * (180 / Math.PI);
  const dark = e.time === "night";
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 0) rotate(${spin * dir})`}>
      <circle r={size * 0.12} fill="#1E1E1E" />
      <circle r={size * 0.06} fill="#BFC5CC" />
      {[0, 60, 120].map((a) => <rect key={a} x={-size * 0.008} y={-size * 0.06} width={size * 0.016} height={size * 0.12} fill="#7A828C" transform={`rotate(${a})`} />)}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
      <ellipse cx={0} cy={size * 0.02} rx={size * 0.5} ry={size * 0.04} fill="rgba(0,0,0,0.25)" />
      <g transform={`translate(0 ${-bounce})`}>
        <path d={`M ${-size * 0.5} ${-size * 0.08} L ${-size * 0.48} ${-size * 0.22} Q ${-size * 0.3} ${-size * 0.26} ${-size * 0.22} ${-size * 0.26} L ${-size * 0.12} ${-size * 0.42} Q ${size * 0.05} ${-size * 0.46} ${size * 0.2} ${-size * 0.42} L ${size * 0.32} ${-size * 0.26} Q ${size * 0.48} ${-size * 0.24} ${size * 0.5} ${-size * 0.14} L ${size * 0.5} ${-size * 0.08} Z`} fill={color} />
        <path d={`M ${-size * 0.08} ${-size * 0.27} L ${-size * 0.02} ${-size * 0.39} Q ${size * 0.06} ${-size * 0.41} ${size * 0.12} ${-size * 0.39} L ${size * 0.2} ${-size * 0.27} Z`} fill={dark ? "#2A3550" : "#BFE3F5"} />
        <path d={`M ${-size * 0.18} ${-size * 0.27} L ${-size * 0.11} ${-size * 0.38} L ${-size * 0.05} ${-size * 0.38} L ${-size * 0.1} ${-size * 0.27} Z`} fill={dark ? "#2A3550" : "#BFE3F5"} />
        <rect x={size * 0.44} y={-size * 0.19} width={size * 0.05} height={size * 0.04} rx={size * 0.01} fill={dark ? "#FFF3B0" : "#FFE9A0"} />
        {dark && <path d={`M ${size * 0.49} ${-size * 0.17} L ${size * 1.3} ${-size * 0.3} L ${size * 1.3} ${size * 0.02} Z`} fill="#FFF3B0" opacity={0.18} />}
        <rect x={-size * 0.5} y={-size * 0.16} width={size * 0.05} height={size * 0.04} fill="#E5484D" />
        {wheel(-size * 0.3)}
        {wheel(size * 0.3)}
      </g>
    </g>
  );
};

export const Rain: React.FC<{ e: Env }> = ({ e }) => (
  <g stroke="rgba(200,220,255,0.55)" strokeWidth={e.base * 0.0025} strokeLinecap="round">
    {Array.from({ length: 160 }).map((_, i) => {
      const len = e.base * 0.04;
      const x = X0(e) + rnd(e, `rx${i}`) * (X1(e) - X0(e)) + ((e.f * e.base * 0.004) % (e.w * 0.1));
      const y = ((rnd(e, `ry${i}`) * e.h + e.f * e.base * 0.035) % (e.h + len)) - len;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.25} y2={y + len} />;
    })}
  </g>
);

export const Fireflies: React.FC<{ e: Env; count?: number }> = ({ e, count = 28 }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = e.w * rnd(e, `ff${i}`) + Math.sin(e.tl * 0.7 + i) * e.base * 0.04;
      const y = e.horizonY + (e.groundY - e.horizonY) * rnd(e, `fg${i}`) + Math.cos(e.tl * 0.9 + i * 2) * e.base * 0.03;
      const glow = Math.max(0, Math.sin(e.f * 0.09 + i * 1.9));
      return (
        <g key={i} opacity={glow}>
          <circle cx={x} cy={y} r={e.base * 0.012} fill="#F7F48B" opacity={0.25} />
          <circle cx={x} cy={y} r={e.base * 0.0035} fill="#FFFDE0" />
        </g>
      );
    })}
  </g>
);
