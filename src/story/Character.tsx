import { z } from "zod";
import type { Viseme } from "./speech";

export const EMOTIONS = ["neutral", "happy", "sad", "surprised", "angry"] as const;
export const GESTURES = ["none", "wave", "point", "explain", "cheer"] as const;
export const HUMAN_TYPES = ["man", "woman", "boy", "girl", "elder", "grandma"] as const;
export const ANIMAL_TYPES = ["cat", "dog", "cow", "chicken"] as const;
export const CHARACTER_TYPES = [...HUMAN_TYPES, "robot", ...ANIMAL_TYPES] as const;
export const OUTFITS = ["casual", "panjabi", "lungi", "saree", "salwar", "abaya", "suit", "doctor", "police", "chef", "school", "worker"] as const;
export const HATS = ["none", "tupi", "cap", "police", "chef", "helmet", "straw", "hijab"] as const;
export const ACCESSORIES = ["glasses", "beard", "mustache", "backpack", "stethoscope", "gamchha", "tie", "book"] as const;
export type Emotion = (typeof EMOTIONS)[number];
export type Gesture = (typeof GESTURES)[number];

export const lookSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(CHARACTER_TYPES),
  // Humans: skin / hair / clothes. Animals: skin = body, hair = markings, shirt = collar/comb. Robot: shirt = body.
  skin: z.string(),
  hair: z.string(),
  shirt: z.string(),
  pants: z.string(),
  // Colour used for this character's name in subtitles.
  color: z.string(),
  outfit: z.enum(OUTFITS).optional(),
  hat: z.enum(HATS).optional(),
  accessories: z.array(z.enum(ACCESSORIES)).optional(),
});
export type Look = z.infer<typeof lookSchema>;

// Rig units: an adult is ~300 units tall, feet at y = 0.
export const RIG_HEIGHT = 300;
export const TYPE_SCALE: Record<Look["type"], number> = {
  man: 1, woman: 0.96, boy: 0.74, girl: 0.72, elder: 0.95, grandma: 0.9, robot: 0.9, cat: 0.42, dog: 0.52, cow: 0.72, chicken: 0.4,
};
// Approximate drawn width (rig units, before TYPE_SCALE) — used to fit characters into tight spaces.
export const TYPE_WIDTH: Record<Look["type"], number> = {
  man: 140, woman: 140, boy: 140, girl: 140, elder: 140, grandma: 140, robot: 150, cat: 270, dog: 300, cow: 470, chicken: 220,
};

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

export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const BROWS: Record<Emotion, [number, number]> = { neutral: [-20, -21], happy: [-22, -19], sad: [-26, -17], surprised: [-29, -28], angry: [-15, -24] };
const LONG_SLEEVES = new Set(["panjabi", "saree", "salwar", "abaya", "suit", "doctor", "chef", "police"]);
const LONG_TOP = new Set(["panjabi", "salwar", "doctor", "abaya"]);
const COVERED_LEGS = new Set(["lungi", "saree", "abaya"]);

const Arm: React.FC<{ side: 1 | -1; upper: number; elbow: number; sleeve: string; skin: string; long: boolean; hold?: React.ReactNode }> = ({ side, upper, elbow, sleeve, skin, long, hold }) => (
  <g transform={`translate(${side * 33} -190) rotate(${upper})`}>
    <rect x={-9.5} y={-4} width={19} height={52} rx={9.5} fill={sleeve} />
    <g transform={`translate(0 44) rotate(${elbow})`}>
      <rect x={-8.5} y={-4} width={17} height={46} rx={8.5} fill={long ? sleeve : skin} />
      {long && <rect x={-8.5} y={34} width={17} height={5} rx={2} fill={shade(sleeve, 0.85)} />}
      <circle cx={0} cy={45} r={10} fill={skin} />
      {hold}
    </g>
  </g>
);

const Leg: React.FC<{ side: 1 | -1; angle: number; pants: string; shoe: string; bare?: string }> = ({ side, angle, pants, shoe, bare }) => (
  <g transform={`translate(${side * 15} -108) rotate(${angle})`}>
    <rect x={-10.5} y={-4} width={21} height={104} rx={10} fill={pants} />
    {bare && <rect x={-8} y={70} width={16} height={28} rx={7} fill={bare} />}
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

// Arm angles [upper, elbow] for the right (+x) arm and the left arm, per gesture.
const armsFor = (pose: Pose): { right: [number, number]; left: [number, number] } => {
  const step = pose.walking ? Math.sin(pose.walkPhase) : 0;
  const swing = step * 20;
  const wob = (k: number, s = 1) => Math.sin(pose.t * k + s);
  let right: [number, number] = [-7 - swing, -8];
  let left: [number, number] = [7 - swing, 8];
  if (pose.gesture === "wave") right = [-128, -30 + wob(12) * 22];
  if (pose.gesture === "point") right = [-92, -6];
  if (pose.gesture === "explain") {
    right = [-30 + wob(4.5) * 10, -62 + wob(4.5, 0.7) * 14];
    left = [26 + wob(3.8, 1.3) * 8, 50 + wob(3.8, 2) * 10];
  }
  if (pose.gesture === "cheer") {
    const b = Math.abs(wob(9)) * 12;
    right = [-158 + b, -12];
    left = [158 - b, 12];
  }
  return { right, left };
};

// ───────────────────────────── human ─────────────────────────────
const defaultsFor = (look: Look) => {
  const female = look.type === "woman" || look.type === "girl" || look.type === "grandma";
  const outfit = look.outfit ?? (look.type === "grandma" ? "saree" : look.type === "elder" ? "panjabi" : "casual");
  const acc = new Set(look.accessories ?? (look.type === "elder" ? ["glasses", "beard", "mustache"] : look.type === "grandma" ? ["glasses"] : []));
  if (outfit === "doctor") acc.add("stethoscope");
  if (outfit === "suit") acc.add("tie");
  const hat = look.hat ?? (outfit === "police" ? "police" : outfit === "chef" ? "chef" : outfit === "worker" ? "helmet" : "none");
  return { female, outfit, acc, hat };
};

const Torso: React.FC<{ look: Look; outfit: string; female: boolean; t: number }> = ({ look, outfit, female, t }) => {
  const s = look.shirt;
  const p = look.pants;
  const sway = Math.sin(t * 2.4) * 2;
  switch (outfit) {
    case "panjabi":
      return (
        <g>
          <path d="M-34 -202 Q0 -210 34 -202 L 40 -62 Q0 -56 -40 -62 Z" fill={s} />
          <path d="M0 -204 L 0 -160" stroke={shade(s, 0.7)} strokeWidth={2.4} />
          {[0, 1, 2].map((k) => <circle key={k} cx={3} cy={-196 + k * 12} r={2} fill={shade(s, 0.6)} />)}
          <path d="M-12 -204 Q0 -196 12 -204" stroke={shade(s, 0.7)} strokeWidth={3} fill="none" />
        </g>
      );
    case "lungi":
      return (
        <g>
          <rect x={-33} y={-202} width={66} height={98} rx={16} fill={s} />
          <path d="M-14 -202 Q0 -186 14 -202" stroke={shade(s, 0.75)} strokeWidth={3} fill="none" />
          <g>
            <path d={`M-38 -112 L 38 -112 L ${44 + sway} -6 L ${-44 + sway} -6 Z`} fill={p} />
            {[-30, -15, 0, 15, 30].map((x) => <line key={x} x1={x} y1={-112} x2={x * 1.15 + sway} y2={-6} stroke={shade(p, 0.75)} strokeWidth={3} />)}
            {[-90, -64, -38].map((y) => <line key={y} x1={-40} y1={y} x2={42} y2={y} stroke={shade(p, 0.75)} strokeWidth={3} />)}
            <rect x={-39} y={-116} width={78} height={10} rx={4} fill={shade(p, 0.8)} />
          </g>
        </g>
      );
    case "saree":
      return (
        <g>
          <path d="M-32 -202 Q0 -208 32 -202 L 36 -120 L -36 -120 Z" fill={shade(s, 0.9)} />
          <path d={`M-40 -122 L 40 -122 L ${46 + sway} -6 L ${-46 + sway} -6 Z`} fill={s} />
          <path d={`M${-46 + sway} -14 L ${46 + sway} -14 L ${46 + sway} -6 L ${-46 + sway} -6 Z`} fill={p} />
          {[-24, -8, 8, 24].map((x) => <line key={x} x1={x * 0.8} y1={-120} x2={x + sway} y2={-14} stroke={shade(s, 0.85)} strokeWidth={2.4} />)}
          {/* pallu over the shoulder */}
          <path d="M-34 -200 L -8 -202 L 40 -112 L 22 -100 Z" fill={s} />
          <path d="M-8 -202 L 40 -112" stroke={p} strokeWidth={7} />
          <path d={`M-36 -196 Q -58 -150 ${-50 + sway} -96`} stroke={s} strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d={`M-44 -196 Q -66 -150 ${-58 + sway} -96`} stroke={p} strokeWidth={4} fill="none" />
        </g>
      );
    case "salwar":
      return (
        <g>
          <path d="M-33 -202 Q0 -208 33 -202 L 44 -66 Q0 -60 -44 -66 Z" fill={s} />
          <path d="M-14 -202 L 0 -180 L 14 -202" fill="none" stroke={shade(s, 0.7)} strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={-20 + k * 10} cy={-80} r={3} fill={p} />)}
          {/* dupatta */}
          <path d={`M-38 -196 Q 0 -168 38 -196 L 44 -188 Q 0 -150 -44 -188 Z`} fill={p} opacity={0.95} />
          <path d={`M38 -194 Q 50 -150 ${44 + sway} -90`} stroke={p} strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
      );
    case "abaya":
      return <path d={`M-32 -202 Q0 -208 32 -202 L ${46 + sway} -6 L ${-46 + sway} -6 Z`} fill={s} />;
    case "suit":
      return (
        <g>
          <rect x={-34} y={-202} width={68} height={104} rx={16} fill={s} />
          <path d="M-14 -202 L 0 -150 L 14 -202 Z" fill="#F4F4F4" />
          <path d="M-14 -202 L -4 -164 L -20 -170 Z M14 -202 L 4 -164 L 20 -170 Z" fill={shade(s, 0.75)} />
          {[0, 1].map((k) => <circle key={k} cx={0} cy={-138 + k * 16} r={2.6} fill={shade(s, 0.55)} />)}
          <rect x={18} y={-170} width={12} height={4} rx={1} fill="#F4F4F4" />
        </g>
      );
    case "doctor":
      return (
        <g>
          <rect x={-30} y={-200} width={60} height={96} rx={14} fill={s} />
          <path d="M-36 -202 L -14 -202 L -6 -150 L -6 -60 L -42 -62 Z" fill="#F7F9FB" />
          <path d="M36 -202 L 14 -202 L 6 -150 L 6 -60 L 42 -62 Z" fill="#F7F9FB" />
          <rect x={-36} y={-112} width={18} height={14} rx={2} fill="#E6ECF2" />
          <rect x={18} y={-170} width={16} height={12} rx={2} fill="#E6ECF2" />
          <rect x={22} y={-176} width={3} height={14} rx={1} fill="#2F6BFF" />
        </g>
      );
    case "police":
      return (
        <g>
          <rect x={-34} y={-202} width={68} height={104} rx={16} fill={s} />
          <path d="M-12 -202 L 0 -186 L 12 -202" fill="none" stroke={shade(s, 0.7)} strokeWidth={3} />
          <rect x={-34} y={-112} width={68} height={10} rx={3} fill="#2A2A2A" />
          <rect x={-6} y={-112} width={12} height={10} rx={2} fill="#D4AF37" />
          <path d="M-26 -176 l 5 -8 l 5 8 l -5 5 z" fill="#D4AF37" />
          <rect x={-40} y={-204} width={20} height={7} rx={2} fill={shade(s, 0.7)} />
          <rect x={20} y={-204} width={20} height={7} rx={2} fill={shade(s, 0.7)} />
          {[0, 1].map((k) => <rect key={k} x={10} y={-180 + k * 26} width={18} height={14} rx={2} fill={shade(s, 0.85)} />)}
        </g>
      );
    case "chef":
      return (
        <g>
          <rect x={-34} y={-202} width={68} height={104} rx={16} fill="#FAFAFA" />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <circle cx={-10} cy={-186 + k * 22} r={3} fill="#BDBDBD" />
              <circle cx={10} cy={-186 + k * 22} r={3} fill="#BDBDBD" />
            </g>
          ))}
          <path d="M-30 -120 L 30 -120 L 34 -70 L -34 -70 Z" fill={s} />
          <path d="M-14 -204 L 14 -204 L 10 -194 L -10 -194 Z" fill={s} />
        </g>
      );
    case "worker":
      return (
        <g>
          <rect x={-34} y={-202} width={68} height={104} rx={16} fill={s} />
          <path d="M-34 -196 L -10 -200 L -14 -100 L -34 -100 Z M34 -196 L 10 -200 L 14 -100 L 34 -100 Z" fill="#FF8A1F" />
          <rect x={-34} y={-140} width={24} height={7} fill="#E8F0F2" />
          <rect x={10} y={-140} width={24} height={7} fill="#E8F0F2" />
        </g>
      );
    case "school":
      return (
        <g>
          {female ? <path d="M-32 -202 Q0 -206 32 -202 L 44 -60 Q0 -54 -44 -60 Z" fill={p} /> : null}
          <rect x={-32} y={-202} width={64} height={female ? 70 : 100} rx={14} fill={s} />
          <path d="M-12 -202 L 0 -190 L 12 -202" fill={shade(s, 0.85)} />
          <path d="M-4 -192 L 4 -192 L 6 -150 L 0 -142 L -6 -150 Z" fill={look.color} />
          <path d="M-26 -176 h 14 v 10 h -14 z" fill={shade(s, 0.9)} stroke={look.color} strokeWidth={1.5} />
        </g>
      );
    default:
      return female ? (
        <g>
          <path d="M-34 -200 Q0 -208 34 -200 L 50 -56 Q0 -46 -50 -56 Z" fill={s} />
          <path d="M-34 -198 L 30 -120 L 42 -128 L -20 -204 Z" fill={p} opacity={0.9} />
        </g>
      ) : (
        <g>
          <rect x={-34} y={-202} width={68} height={104} rx={18} fill={s} />
          <path d="M-12 -202 L 0 -184 L 12 -202" fill="none" stroke={shade(s, 0.75)} strokeWidth={3} />
          <rect x={-34} y={-112} width={68} height={10} rx={4} fill={shade(p, 0.85)} />
        </g>
      );
  }
};

const Hair: React.FC<{ look: Look; hat: string; front: boolean }> = ({ look, hat, front }) => {
  if (hat === "hijab") return null;
  const h = look.hair;
  const t = look.type;
  if (!front) {
    if (t === "woman") return <path d="M-46 -8 C -50 -56, 50 -56, 46 -8 L 50 72 C 30 86, -30 86, -50 72 Z" fill={h} />;
    if (t === "girl") return <g fill={h}><circle cx={-47} cy={14} r={15} /><circle cx={47} cy={14} r={15} /></g>;
    if (t === "grandma") return <circle cx={0} cy={-46} r={18} fill={h} />;
    return null;
  }
  if (t === "man") return <path d="M-41 -8 C -46 -54, 46 -54, 41 -8 C 34 -30, 10 -38, -6 -31 C -20 -26, -34 -22, -41 -8 Z" fill={h} />;
  if (t === "woman") return <path d="M-41 -6 C -44 -54, 44 -54, 41 -6 C 32 -32, 4 -40, -12 -28 C -24 -20, -34 -14, -41 -6 Z" fill={h} />;
  if (t === "boy") return <path d="M-40 -12 L -38 -40 L -26 -34 L -20 -52 L -8 -40 L 2 -56 L 12 -40 L 24 -50 L 28 -34 L 40 -38 L 41 -12 C 20 -30, -20 -30, -40 -12 Z" fill={h} />;
  if (t === "girl") return <path d="M-41 -6 C -44 -54, 44 -54, 41 -6 L 36 -18 L 24 -12 L 14 -20 L 2 -12 L -10 -20 L -22 -12 L -34 -18 Z" fill={h} />;
  if (t === "grandma") return <path d="M-42 -2 C -46 -52, 46 -52, 42 -2 C 30 -26, 0 -34, -30 -22 Z" fill={h} />;
  if (t === "elder") return (
    <g fill={h}>
      <ellipse cx={-37} cy={-10} rx={8} ry={15} />
      <ellipse cx={37} cy={-10} rx={8} ry={15} />
    </g>
  );
  return null;
};

const Hat: React.FC<{ hat: string; color: string }> = ({ hat, color }) => {
  switch (hat) {
    case "tupi":
      return <g><path d="M-36 -20 C -36 -52, 36 -52, 36 -20 Z" fill="#FAFAFA" />{[-24, -8, 8, 24].map((x) => <circle key={x} cx={x} cy={-32} r={2.4} fill="#D9D9D9" />)}</g>;
    case "cap":
      return <g><path d="M-40 -18 C -40 -60, 40 -60, 40 -18 Z" fill={color} /><path d="M20 -20 L 70 -16 Q 72 -10 64 -9 L 20 -12 Z" fill={shade(color, 0.75)} /><circle cx={0} cy={-55} r={4} fill={shade(color, 0.7)} /></g>;
    case "police":
      return <g><rect x={-38} y={-40} width={76} height={24} rx={4} fill="#1F2A44" /><path d="M-46 -40 C -40 -66, 40 -66, 46 -40 Z" fill="#26324F" /><path d="M14 -18 L 56 -14 Q 56 -8 48 -8 L 14 -12 Z" fill="#111" /><circle cx={0} cy={-40} r={7} fill="#D4AF37" /></g>;
    case "chef":
      return <g fill="#FFFFFF" stroke="#E2E2E2" strokeWidth={2}><rect x={-30} y={-46} width={60} height={22} /><circle cx={-22} cy={-62} r={18} /><circle cx={0} cy={-74} r={22} /><circle cx={22} cy={-62} r={18} /></g>;
    case "helmet":
      return <g><path d="M-44 -18 C -44 -70, 44 -70, 44 -18 Z" fill="#FFC21A" /><rect x={-50} y={-22} width={100} height={8} rx={4} fill="#E6A800" /><rect x={-4} y={-62} width={8} height={40} rx={3} fill="#E6A800" /></g>;
    case "straw":
      return <g><ellipse cx={0} cy={-26} rx={70} ry={14} fill="#D9B45A" /><path d="M-30 -28 C -26 -64, 26 -64, 30 -28 Z" fill="#E2C06A" /><rect x={-30} y={-36} width={60} height={7} fill="#B5402A" />{[-50, -25, 25, 50].map((x) => <line key={x} x1={x * 0.9} y1={-30} x2={x} y2={-20} stroke="#B99540" strokeWidth={2} />)}</g>;
    default:
      return null;
  }
};

const Human: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { t, walking, walkPhase, emotion } = pose;
  const { female, outfit, acc, hat } = defaultsFor(look);
  const elderly = look.type === "elder" || look.type === "grandma";
  const coveredLegs = COVERED_LEGS.has(outfit);
  const sandal = outfit === "lungi" || outfit === "panjabi" || outfit === "saree";
  const shoe = sandal ? "#6B4226" : "#2B2B2B";
  const legColor = outfit === "panjabi" ? "#F2F2F2" : outfit === "school" ? (female ? look.skin : look.pants) : outfit === "chef" ? "#3A3A3A" : look.pants;

  const step = walking ? Math.sin(walkPhase) : 0;
  const bob = walking ? -Math.abs(Math.cos(walkPhase)) * 5 : Math.sin(t * 2.2) * 1.2;
  const breathe = 1 + Math.sin(t * 2.2) * 0.012;
  const headTilt = pose.talking ? Math.sin(t * 6.5) * 2.2 * (0.4 + pose.mouth) : Math.sin(t * 0.9) * 1.2;
  const headNod = pose.talking ? Math.sin(t * 8) * 1.5 * pose.mouth : 0;
  const { right, left } = armsFor(pose);
  const eyeScale = emotion === "surprised" ? 1.2 : emotion === "happy" ? 0.85 : 1;
  const eyeRy = Math.max(0.9, 10 * eyeScale * (1 - pose.blink));
  const [browIn, browOut] = BROWS[emotion];
  const long = LONG_SLEEVES.has(outfit) || elderly;
  const sleeve = outfit === "doctor" ? "#F7F9FB" : outfit === "chef" ? "#FAFAFA" : outfit === "worker" ? look.shirt : look.shirt;
  const book = acc.has("book") ? <rect x={-14} y={36} width={28} height={20} rx={2} fill={look.color} stroke="#fff" strokeWidth={2} /> : undefined;

  return (
    <g transform={`translate(0 ${bob})`}>
      {acc.has("backpack") && <rect x={-46} y={-196} width={30} height={78} rx={10} fill={look.color} stroke={shade(look.color, 0.7)} strokeWidth={3} />}
      <Leg side={-1} angle={-step * (coveredLegs ? 10 : 22)} pants={coveredLegs ? look.skin : legColor} shoe={shoe} />
      <Leg side={1} angle={step * (coveredLegs ? 10 : 22)} pants={coveredLegs ? look.skin : legColor} shoe={shoe} />

      <g transform={`translate(0 -250) rotate(${headTilt})`}>
        <Hair look={look} hat={hat} front={false} />
        {hat === "hijab" && <path d="M-50 -10 C -52 -64, 52 -64, 50 -10 L 56 70 C 30 92, -30 92, -56 70 Z" fill={look.pants} />}
      </g>

      <g transform={`translate(0 -105) scale(1 ${breathe}) translate(0 105)`}>
        <Torso look={look} outfit={outfit} female={female} t={t} />
        {acc.has("tie") && <path d="M-5 -194 L 5 -194 L 7 -140 L 0 -130 L -7 -140 Z" fill={look.color} />}
        {acc.has("gamchha") && (
          <g>
            <path d="M-30 -202 Q -6 -180 18 -204 L 26 -196 Q -4 -168 -34 -192 Z" fill="#D7263D" />
            {[-20, -8, 4, 16].map((x) => <line key={x} x1={x} y1={-198} x2={x + 2} y2={-184} stroke="#fff" strokeWidth={2} />)}
            <path d="M22 -198 L 30 -120 L 40 -122 L 30 -200 Z" fill="#D7263D" />
          </g>
        )}
        {acc.has("stethoscope") && <path d="M-14 -204 Q -22 -160 -2 -150 Q 14 -146 14 -168" stroke="#334155" strokeWidth={3.5} fill="none" strokeLinecap="round" />}
        {acc.has("stethoscope") && <circle cx={14} cy={-170} r={5} fill="#94A3B8" stroke="#334155" strokeWidth={2} />}
      </g>

      <Arm side={-1} upper={left[0]} elbow={left[1]} sleeve={sleeve} skin={look.skin} long={long} hold={book} />
      <Arm side={1} upper={right[0]} elbow={right[1]} sleeve={sleeve} skin={look.skin} long={long} />

      <rect x={-8} y={-214} width={16} height={18} fill={shade(look.skin, 0.88)} />
      <g transform={`translate(0 ${-250 + headNod}) rotate(${headTilt})`}>
        {hat !== "hijab" && <circle cx={-40} cy={2} r={8} fill={shade(look.skin, 0.92)} />}
        {hat !== "hijab" && <circle cx={40} cy={2} r={8} fill={shade(look.skin, 0.92)} />}
        <ellipse cx={0} cy={0} rx={40} ry={44} fill={look.skin} />
        {elderly && <path d="M-26 -22 Q -14 -26 -4 -22 M4 -22 Q 14 -26 26 -22" stroke={shade(look.skin, 0.8)} strokeWidth={1.6} fill="none" />}
        <Hair look={look} hat={hat} front />
        {hat === "hijab" && <path d="M-44 -6 C -46 -56, 46 -56, 44 -6 C 40 -34, 20 -40, 0 -40 C -20 -40, -40 -34, -44 -6 Z" fill={look.pants} />}
        {hat === "hijab" && <path d="M-44 -6 Q -48 40 -20 50 M44 -6 Q 48 40 20 50" stroke={look.pants} strokeWidth={8} fill="none" />}
        <Hat hat={hat} color={look.color} />

        {(emotion === "happy" || female) && (
          <g fill="#FF7B8A" opacity={emotion === "happy" ? 0.45 : 0.25}>
            <circle cx={-25} cy={14} r={7} />
            <circle cx={25} cy={14} r={7} />
          </g>
        )}
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
        {[-1, 1].map((s) => (
          <path key={s} d={`M ${s * 7} ${browIn} L ${s * 23} ${browOut}`} stroke={elderly ? "#BDBDBD" : shade(look.hair, 0.9)} strokeWidth={4} strokeLinecap="round" />
        ))}
        <path d="M-2 6 Q 3 12 -3 13" stroke={shade(look.skin, 0.7)} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {acc.has("beard") && <path d="M-34 6 C -34 62, 34 62, 34 6 C 26 36, -26 36, -34 6 Z" fill={elderly ? "#E5E5E5" : look.hair} />}
        <g transform="translate(0 26)">
          <Mouth viseme={pose.viseme} open={pose.mouth} emotion={emotion} />
        </g>
        {acc.has("mustache") && <path d="M-15 20 Q -7 13 0 19 Q 7 13 15 20 Q 7 19 0 23 Q -7 19 -15 20 Z" fill={elderly ? "#E5E5E5" : look.hair} />}
        {acc.has("glasses") && (
          <>
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

// ───────────────────────────── robot ─────────────────────────────
const Robot: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { t, walking, walkPhase } = pose;
  const body = look.shirt;
  const metal = shade(body, 0.8);
  const step = walking ? Math.sin(walkPhase) : 0;
  const bob = walking ? -Math.abs(Math.cos(walkPhase)) * 4 : Math.sin(t * 3) * 2;
  const { right, left } = armsFor(pose);
  const eye = pose.emotion === "happy" ? "M-8 2 Q 0 -8 8 2" : pose.emotion === "sad" ? "M-8 -4 Q 0 6 8 -4" : null;
  const glow = look.color;
  return (
    <g transform={`translate(0 ${bob})`}>
      <Leg side={-1} angle={-step * 18} pants={metal} shoe={shade(body, 0.55)} />
      <Leg side={1} angle={step * 18} pants={metal} shoe={shade(body, 0.55)} />
      <rect x={-40} y={-206} width={80} height={104} rx={14} fill={body} />
      <rect x={-24} y={-186} width={48} height={40} rx={6} fill="#1B2233" />
      {Array.from({ length: 5 }).map((_, k) => (
        <rect key={k} x={-19 + k * 8.5} y={-150 - (pose.talking ? Math.abs(Math.sin(t * 10 + k)) * 26 * pose.mouth + 4 : 4)} width={6} height={pose.talking ? Math.abs(Math.sin(t * 10 + k)) * 26 * pose.mouth + 4 : 4} fill={glow} />
      ))}
      <circle cx={-26} cy={-120} r={4} fill={Math.sin(t * 4) > 0 ? "#4DFFB0" : "#1B5E43"} />
      <circle cx={26} cy={-120} r={4} fill={Math.sin(t * 4 + 2) > 0 ? "#FF4D6D" : "#5E1B2A"} />
      <Arm side={-1} upper={left[0]} elbow={left[1]} sleeve={metal} skin={shade(body, 0.6)} long />
      <Arm side={1} upper={right[0]} elbow={right[1]} sleeve={metal} skin={shade(body, 0.6)} long />
      <rect x={-8} y={-218} width={16} height={14} fill={metal} />
      <g transform={`translate(0 -258) rotate(${Math.sin(t * 1.5) * 4})`}>
        <line x1={0} y1={-42} x2={0} y2={-64} stroke={metal} strokeWidth={4} />
        <circle cx={0} cy={-68} r={7} fill={glow} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
        <rect x={-46} y={-42} width={92} height={78} rx={18} fill={body} />
        <rect x={-52} y={-12} width={8} height={22} rx={3} fill={metal} />
        <rect x={44} y={-12} width={8} height={22} rx={3} fill={metal} />
        <rect x={-36} y={-30} width={72} height={52} rx={12} fill="#0E1424" />
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 16} -8)`}>
            {pose.blink > 0.5 ? <rect x={-9} y={-1} width={18} height={3} rx={1.5} fill={glow} /> : eye ? <path d={eye} stroke={glow} strokeWidth={4} fill="none" strokeLinecap="round" /> : <circle r={8} fill={glow} />}
          </g>
        ))}
        <rect x={-14} y={12} width={28} height={4 + pose.mouth * 6} rx={2} fill={glow} opacity={0.85} />
      </g>
    </g>
  );
};

// ───────────────────────────── animals ─────────────────────────────
// Side view, facing right, feet at y = 0. skin = body, hair = markings, shirt = collar / comb.
const AnimalLegs: React.FC<{ xs: number[]; top: number; len: number; w: number; color: string; hoof: string; pose: Pose }> = ({ xs, top, len, w, color, hoof, pose }) => {
  const step = pose.walking ? Math.sin(pose.walkPhase) : 0;
  return (
    <g>
      {xs.map((x, i) => (
        <g key={i} transform={`translate(${x} ${top}) rotate(${(i % 2 ? 1 : -1) * step * 22})`}>
          <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={color} />
          <ellipse cx={2} cy={len} rx={w * 0.65} ry={w * 0.32} fill={hoof} />
        </g>
      ))}
    </g>
  );
};

const AnimalEye: React.FC<{ x: number; y: number; r: number; pose: Pose }> = ({ x, y, r, pose }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={Math.max(1, r * (1 - pose.blink))} fill="#fff" />
    {pose.blink < 0.6 && <circle cx={x + r * 0.25} cy={y} r={r * 0.55} fill="#1A1410" />}
    {pose.blink < 0.6 && <circle cx={x + r * 0.4} cy={y - r * 0.25} r={r * 0.18} fill="#fff" />}
  </g>
);

const Animal: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  const { t } = pose;
  const body = look.skin;
  const mark = look.hair;
  const accent = look.shirt;
  const bob = pose.walking ? -Math.abs(Math.cos(pose.walkPhase)) * 6 : Math.sin(t * 2.4) * 1.5;
  const happy = pose.emotion === "happy" || pose.talking;
  const tail = Math.sin(t * (happy ? 12 : 3)) * (happy ? 18 : 8);
  const headBob = pose.talking ? Math.sin(t * 9) * 3 * pose.mouth : 0;
  const mouthOpen = pose.mouth;

  if (look.type === "chicken") {
    const flap = pose.gesture === "cheer" || pose.gesture === "wave" ? Math.abs(Math.sin(t * 14)) * 40 : Math.sin(t * 2) * 4;
    return (
      <g transform={`translate(0 ${bob})`}>
        <AnimalLegs xs={[-14, 14]} top={-70} len={70} w={8} color="#F2A900" hoof="#F2A900" pose={pose} />
        <path d={`M-70 -150 Q -110 ${-210 + tail} -76 -200 Q -96 -230 -60 -190 Z`} fill={mark} />
        <ellipse cx={0} cy={-130} rx={78} ry={66} fill={body} />
        <path d={`M-20 -140 Q 10 -110 40 -${130 - flap * 0.3} Q 0 -${170 + flap} -20 -140 Z`} fill={shade(body, 0.88)} />
        <g transform={`translate(52 ${-210 + headBob})`}>
          <path d="M-18 -40 q 8 -22 16 0 q 8 -24 16 0 q 8 -18 14 4 z" fill={accent} />
          <circle cx={0} cy={0} r={38} fill={body} />
          <AnimalEye x={12} y={-8} r={9} pose={pose} />
          <path d={`M34 -6 L 56 ${2 - mouthOpen * 4} L 34 6 Z`} fill="#F2A900" />
          <path d={`M34 6 L 52 ${10 + mouthOpen * 10} L 34 12 Z`} fill="#E08E00" />
          <ellipse cx={28} cy={24} rx={8} ry={12} fill={accent} />
        </g>
      </g>
    );
  }

  if (look.type === "cow") {
    return (
      <g transform={`translate(0 ${bob})`}>
        <AnimalLegs xs={[-92, -62, 58, 88]} top={-120} len={120} w={26} color={body} hoof="#3A2A20" pose={pose} />
        <path d={`M-150 -190 Q ${-176 + tail} -130 ${-166 + tail} -90`} stroke={body} strokeWidth={8} fill="none" />
        <circle cx={-166 + tail} cy={-86} r={10} fill={mark} />
        <ellipse cx={0} cy={-180} rx={150} ry={78} fill={body} />
        <path d="M-90 -230 q 30 -10 40 20 q -10 30 -50 18 z M30 -150 q 40 -20 60 10 q -10 34 -50 24 z M-40 -150 q 20 -6 24 16 q -14 18 -30 4 z" fill={mark} />
        <ellipse cx={20} cy={-112} rx={26} ry={14} fill="#F4A6B8" />
        <g transform={`translate(150 ${-220 + headBob})`}>
          <path d="M-22 -48 q -10 -26 -2 -36 M22 -48 q 10 -26 2 -36" stroke="#EDE3CF" strokeWidth={9} fill="none" strokeLinecap="round" />
          <ellipse cx={-38} cy={-30} rx={22} ry={10} fill={body} transform="rotate(-20 -38 -30)" />
          <ellipse cx={0} cy={0} rx={48} ry={56} fill={body} />
          <path d="M-20 -50 q 20 -10 40 0 q -6 20 -20 24 q -14 -4 -20 -24 z" fill={mark} />
          <AnimalEye x={-14} y={-10} r={9} pose={pose} />
          <AnimalEye x={18} y={-10} r={9} pose={pose} />
          <ellipse cx={4} cy={34} rx={40} ry={26} fill="#F4A6B8" />
          <ellipse cx={-10} cy={30} rx={6} ry={8} fill="#7A3A4A" />
          <ellipse cx={18} cy={30} rx={6} ry={8} fill="#7A3A4A" />
          <ellipse cx={4} cy={50} rx={14} ry={2 + mouthOpen * 8} fill="#5A1A2A" />
          <path d="M-26 64 q 30 14 60 0" stroke={accent} strokeWidth={8} fill="none" />
          <circle cx={4} cy={76} r={10} fill="#D4AF37" />
        </g>
      </g>
    );
  }

  // cat & dog share a body plan
  const dog = look.type === "dog";
  return (
    <g transform={`translate(0 ${bob})`}>
      <AnimalLegs xs={dog ? [-62, -38, 44, 68] : [-50, -30, 34, 54]} top={dog ? -90 : -70} len={dog ? 90 : 70} w={dog ? 22 : 17} color={body} hoof={shade(body, 0.8)} pose={pose} />
      <path d={dog ? `M-92 -140 Q ${-130 + tail} ${-190 - Math.abs(tail)} ${-118 + tail} -210` : `M-74 -110 Q -130 -120 ${-120 + tail} -200 Q ${-112 + tail} -230 ${-100 + tail * 0.6} -220`} stroke={body} strokeWidth={dog ? 16 : 13} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={dog ? -140 : -110} rx={dog ? 100 : 82} ry={dog ? 54 : 46} fill={body} />
      {dog ? <ellipse cx={-30} cy={-150} rx={38} ry={30} fill={mark} /> : <path d="M-50 -140 q 10 -10 20 0 M-20 -150 q 10 -10 20 0 M10 -148 q 10 -10 20 0" stroke={mark} strokeWidth={8} fill="none" strokeLinecap="round" />}
      <g transform={`translate(${dog ? 96 : 82} ${(dog ? -200 : -165) + headBob})`}>
        {dog ? (
          <path d="M-30 -26 q -30 10 -24 56 q 14 4 22 -14 z" fill={mark} />
        ) : (
          <g fill={body}>
            <path d="M-34 -24 L -26 -66 L -2 -38 Z" />
            <path d="M8 -38 L 30 -66 L 36 -22 Z" />
            <path d="M-28 -30 L -24 -54 L -10 -38 Z M14 -38 L 28 -54 L 30 -30 Z" fill="#F4A6B8" />
          </g>
        )}
        <ellipse cx={0} cy={0} rx={dog ? 44 : 42} ry={dog ? 42 : 38} fill={body} />
        <ellipse cx={dog ? 38 : 26} cy={dog ? 12 : 14} rx={dog ? 30 : 20} ry={dog ? 20 : 15} fill={shade(body, 1.12)} />
        <AnimalEye x={-6} y={-8} r={dog ? 9 : 10} pose={pose} />
        <AnimalEye x={dog ? 20 : 20} y={-8} r={dog ? 9 : 10} pose={pose} />
        <ellipse cx={dog ? 62 : 40} cy={dog ? 4 : 8} rx={dog ? 10 : 6} ry={dog ? 8 : 5} fill={dog ? "#1A1410" : "#E86A8A"} />
        <ellipse cx={dog ? 46 : 32} cy={dog ? 24 : 22} rx={dog ? 14 : 9} ry={2 + mouthOpen * (dog ? 12 : 8)} fill="#5A1A2A" />
        {dog && mouthOpen < 0.2 && happy && <ellipse cx={48} cy={32} rx={6} ry={9} fill="#E86A8A" />}
        {!dog && [-1, 1].map((s) => <g key={s} stroke="#555" strokeWidth={1.6}><line x1={40} y1={12} x2={70} y2={12 + s * 8} /><line x1={40} y1={16} x2={68} y2={20 + s * 10} /></g>)}
        {dog && <path d="M-36 30 q 30 18 64 6" stroke={accent} strokeWidth={9} fill="none" />}
        {!dog && <path d="M-30 30 q 28 14 54 4" stroke={accent} strokeWidth={7} fill="none" />}
        <circle cx={dog ? -4 : -2} cy={dog ? 44 : 40} r={dog ? 7 : 5} fill="#D4AF37" />
      </g>
    </g>
  );
};

// Original 2D cartoon cast: humans with outfits/hats/accessories, a robot and animals.
// All share the same Pose (lip-sync, blink, emotion, gesture, walk), so any of them can talk in a story.
export const Character: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => {
  if (look.type === "robot") return <Robot look={look} pose={pose} />;
  if ((ANIMAL_TYPES as readonly string[]).includes(look.type)) return <Animal look={look} pose={pose} />;
  return <Human look={look} pose={pose} />;
};
