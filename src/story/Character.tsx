import { z } from "zod";
import type { Viseme } from "./speech";

export const EMOTIONS = ["neutral", "happy", "sad", "surprised", "angry"] as const;
export const GESTURES = ["none", "wave", "point", "explain", "cheer"] as const;
export const CHARACTER_TYPES = ["man", "woman", "boy", "girl", "elder"] as const;
export type Emotion = (typeof EMOTIONS)[number];
export type Gesture = (typeof GESTURES)[number];

export const lookSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(CHARACTER_TYPES),
  skin: z.string(),
  hair: z.string(),
  shirt: z.string(),
  pants: z.string(),
  // Colour used for this character's name in subtitles.
  color: z.string(),
});
export type Look = z.infer<typeof lookSchema>;

// Rig units: an adult is ~300 units tall, feet at y = 0.
export const RIG_HEIGHT = 300;
export const TYPE_SCALE: Record<Look["type"], number> = { man: 1, woman: 0.96, boy: 0.74, girl: 0.72, elder: 0.95 };

export type Pose = {
  t: number; // seconds, drives idle motion
  mouth: number; // 0..1 openness
  viseme: Viseme;
  blink: number; // 0 open .. 1 closed
  emotion: Emotion;
  gesture: Gesture;
  walking: boolean;
  walkPhase: number; // radians
  lookX: number; // -1..1 in the character's own facing
  talking: boolean;
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const BROWS: Record<Emotion, [number, number]> = { neutral: [-20, -21], happy: [-22, -19], sad: [-26, -17], surprised: [-29, -28], angry: [-15, -24] };

const Arm: React.FC<{ side: 1 | -1; upper: number; elbow: number; sleeve: string; skin: string; long: boolean }> = ({ side, upper, elbow, sleeve, skin, long }) => (
  <g transform={`translate(${side * 33} -190) rotate(${upper})`}>
    <rect x={-9.5} y={-4} width={19} height={52} rx={9.5} fill={sleeve} />
    <g transform={`translate(0 44) rotate(${elbow})`}>
      <rect x={-8.5} y={-4} width={17} height={46} rx={8.5} fill={long ? sleeve : skin} />
      <circle cx={0} cy={45} r={10} fill={skin} />
    </g>
  </g>
);

const Leg: React.FC<{ side: 1 | -1; angle: number; pants: string; shoe: string }> = ({ side, angle, pants, shoe }) => (
  <g transform={`translate(${side * 15} -108) rotate(${angle})`}>
    <rect x={-10.5} y={-4} width={21} height={104} rx={10} fill={pants} />
    <ellipse cx={side * 5} cy={101} rx={16} ry={7.5} fill={shoe} />
  </g>
);

const Mouth: React.FC<{ viseme: Viseme; open: number; emotion: Emotion }> = ({ viseme, open, emotion }) => {
  const dark = "#5A1A2A";
  if (viseme === "rest") {
    if (emotion === "surprised") return <ellipse cx={0} cy={0} rx={5} ry={6} fill={dark} />;
    const d =
      emotion === "happy" ? "M-13 -3 Q0 12 13 -3" : emotion === "sad" ? "M-10 5 Q0 -4 10 5" : emotion === "angry" ? "M-10 2 Q0 -1 10 2" : "M-10 -1 Q0 6 10 -1";
    return <path d={d} stroke="#3A1F1A" strokeWidth={3.2} fill={emotion === "happy" ? "#fff" : "none"} strokeLinecap="round" />;
  }
  const o = Math.max(0.15, open);
  if (viseme === "round") return <ellipse cx={0} cy={1} rx={5.5 + o * 2} ry={4 + o * 7} fill={dark} />;
  if (viseme === "teeth")
    return (
      <g>
        <rect x={-11} y={-3} width={22} height={4 + o * 7} rx={4} fill={dark} />
        <rect x={-10} y={-3} width={20} height={3.5} rx={1.5} fill="#fff" />
      </g>
    );
  const rx = viseme === "wide" ? 12 + o * 2 : 9 + o * 2;
  return (
    <g>
      <ellipse cx={0} cy={1} rx={rx} ry={2.5 + o * 10} fill={dark} />
      <ellipse cx={0} cy={2 + o * 6} rx={rx * 0.55} ry={1.5 + o * 3.5} fill="#E0707A" />
      {viseme === "wide" && <rect x={-rx * 0.75} y={-1.5 - o * 8} width={rx * 1.5} height={3} rx={1.5} fill="#fff" />}
    </g>
  );
};

// Original 2D cartoon rig: blinking eyes, emotional eyebrows, lip-sync mouth shapes, talking head bob,
// two-segment arms with gestures, walk cycle and breathing. Facing is handled by the parent (scaleX).
export const Character: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { t, walking, walkPhase, gesture, emotion } = pose;
  const female = look.type === "woman" || look.type === "girl";
  const elder = look.type === "elder";
  const shoe = "#2B2B2B";

  // ── body motion ──
  const step = walking ? Math.sin(walkPhase) : 0;
  const bob = walking ? -Math.abs(Math.cos(walkPhase)) * 5 : Math.sin(t * 2.2) * 1.2;
  const breathe = 1 + Math.sin(t * 2.2) * 0.012;
  const headTilt = pose.talking ? Math.sin(t * 6.5) * 2.2 * (0.4 + pose.mouth) : Math.sin(t * 0.9) * 1.2;
  const headNod = pose.talking ? Math.sin(t * 8) * 1.5 * pose.mouth : 0;

  // ── arms: [upper, elbow] for right (+x) arm; left arm mirrors ──
  const swing = step * 20;
  let right: [number, number] = [-7 - swing, -8];
  let left: [number, number] = [7 - swing, 8];
  const wob = (k: number, s = 1) => Math.sin(t * k + s);
  if (gesture === "wave") right = [-128, -30 + wob(12) * 22];
  if (gesture === "point") right = [-92, -6];
  if (gesture === "explain") {
    right = [-30 + wob(4.5) * 10, -62 + wob(4.5, 0.7) * 14];
    left = [26 + wob(3.8, 1.3) * 8, 50 + wob(3.8, 2) * 10];
  }
  if (gesture === "cheer") {
    const b = Math.abs(wob(9)) * 12;
    right = [-158 + b, -12];
    left = [158 - b, 12];
  }

  const eyeScale = emotion === "surprised" ? 1.2 : emotion === "happy" ? 0.85 : 1;
  const eyeRy = Math.max(0.9, 10 * eyeScale * (1 - pose.blink));
  const [browIn, browOut] = BROWS[emotion];
  const sleeveLong = elder;

  return (
    <g transform={`translate(0 ${bob})`}>
      {/* legs (behind body) */}
      <Leg side={-1} angle={-step * 22} pants={look.pants} shoe={shoe} />
      <Leg side={1} angle={step * 22} pants={look.pants} shoe={shoe} />

      {/* back hair for long-haired looks */}
      <g transform={`translate(0 -250) rotate(${headTilt})`}>
        {look.type === "woman" && <path d="M-46 -8 C -50 -56, 50 -56, 46 -8 L 50 72 C 30 86, -30 86, -50 72 Z" fill={look.hair} />}
        {look.type === "girl" && (
          <g fill={look.hair}>
            <circle cx={-47} cy={14} r={15} />
            <circle cx={47} cy={14} r={15} />
          </g>
        )}
      </g>

      {/* torso */}
      <g transform={`translate(0 -105) scale(1 ${breathe}) translate(0 105)`}>
        {female ? (
          <>
            <path d="M-34 -200 Q0 -208 34 -200 L 50 -56 Q0 -46 -50 -56 Z" fill={look.shirt} />
            <path d="M-34 -198 L 30 -120 L 42 -128 L -20 -204 Z" fill={look.pants} opacity={0.9} />
          </>
        ) : (
          <>
            <rect x={-34} y={-202} width={68} height={elder ? 126 : 104} rx={18} fill={look.shirt} />
            <path d="M-12 -202 L 0 -184 L 12 -202" fill="none" stroke={shade(look.shirt, 0.75)} strokeWidth={3} />
            {!elder && <rect x={-34} y={-112} width={68} height={10} rx={4} fill={shade(look.pants, 0.85)} />}
            {elder && [0, 1, 2].map((k) => <circle key={k} cx={0} cy={-180 + k * 14} r={2.2} fill={shade(look.shirt, 0.7)} />)}
          </>
        )}
      </g>

      {/* arms */}
      <Arm side={-1} upper={left[0]} elbow={left[1]} sleeve={look.shirt} skin={look.skin} long={sleeveLong} />
      <Arm side={1} upper={right[0]} elbow={right[1]} sleeve={look.shirt} skin={look.skin} long={sleeveLong} />

      {/* neck + head */}
      <rect x={-8} y={-214} width={16} height={18} fill={shade(look.skin, 0.88)} />
      <g transform={`translate(0 ${-250 + headNod}) rotate(${headTilt})`}>
        <circle cx={-40} cy={2} r={8} fill={shade(look.skin, 0.92)} />
        <circle cx={40} cy={2} r={8} fill={shade(look.skin, 0.92)} />
        <ellipse cx={0} cy={0} rx={40} ry={44} fill={look.skin} />

        {/* front hair */}
        {look.type === "man" && <path d="M-41 -8 C -46 -54, 46 -54, 41 -8 C 34 -30, 10 -38, -6 -31 C -20 -26, -34 -22, -41 -8 Z" fill={look.hair} />}
        {look.type === "woman" && <path d="M-41 -6 C -44 -54, 44 -54, 41 -6 C 32 -32, 4 -40, -12 -28 C -24 -20, -34 -14, -41 -6 Z" fill={look.hair} />}
        {look.type === "boy" && <path d="M-40 -12 L -38 -40 L -26 -34 L -20 -52 L -8 -40 L 2 -56 L 12 -40 L 24 -50 L 28 -34 L 40 -38 L 41 -12 C 20 -30, -20 -30, -40 -12 Z" fill={look.hair} />}
        {look.type === "girl" && <path d="M-41 -6 C -44 -54, 44 -54, 41 -6 L 36 -18 L 24 -12 L 14 -20 L 2 -12 L -10 -20 L -22 -12 L -34 -18 Z" fill={look.hair} />}
        {elder && (
          <g fill={look.hair}>
            <ellipse cx={-37} cy={-10} rx={8} ry={15} />
            <ellipse cx={37} cy={-10} rx={8} ry={15} />
            <ellipse cx={-10} cy={-34} rx={14} ry={5} fill="rgba(255,255,255,0.35)" />
          </g>
        )}

        {/* cheeks */}
        {(emotion === "happy" || female) && (
          <g fill="#FF7B8A" opacity={emotion === "happy" ? 0.45 : 0.25}>
            <circle cx={-25} cy={14} r={7} />
            <circle cx={25} cy={14} r={7} />
          </g>
        )}

        {/* eyes */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 15} -4)`}>
            <ellipse cx={0} cy={0} rx={8.5 * eyeScale} ry={eyeRy} fill="#fff" />
            {pose.blink < 0.6 && (
              <>
                <circle cx={pose.lookX * 3.2} cy={1} r={4.6 * Math.min(1, eyeRy / 8)} fill="#20160F" />
                <circle cx={pose.lookX * 3.2 + 1.6} cy={-1} r={1.4} fill="#fff" />
              </>
            )}
            {female && <path d={`M ${s * 7} -7 L ${s * 12} -11`} stroke="#20160F" strokeWidth={2} strokeLinecap="round" />}
          </g>
        ))}
        {/* brows */}
        {[-1, 1].map((s) => (
          <path key={s} d={`M ${s * 7} ${browIn} L ${s * 23} ${browOut}`} stroke={elder ? "#BDBDBD" : shade(look.hair, 0.9)} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* nose */}
        <path d="M-2 6 Q 3 12 -3 13" stroke={shade(look.skin, 0.7)} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {elder && <path d="M-34 6 C -34 62, 34 62, 34 6 C 26 36, -26 36, -34 6 Z" fill={look.hair} />}
        <g transform="translate(0 26)">
          <Mouth viseme={pose.viseme} open={pose.mouth} emotion={emotion} />
        </g>
        {elder && (
          <>
            <path d="M-15 20 Q -7 13 0 19 Q 7 13 15 20 Q 7 19 0 23 Q -7 19 -15 20 Z" fill={look.hair} />
            <g fill="rgba(255,255,255,0.15)" stroke="#333" strokeWidth={2.4}>
              <circle cx={-15} cy={-4} r={11} />
              <circle cx={15} cy={-4} r={11} />
            </g>
            <line x1={-4} y1={-5} x2={4} y2={-5} stroke="#333" strokeWidth={2.4} />
          </>
        )}
      </g>
    </g>
  );
};
