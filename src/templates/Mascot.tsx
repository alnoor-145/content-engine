import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const mascotSchema = z.object({
  // Each line is one speech bubble. Bangla works too.
  lines: z.array(z.string()).min(1),
  framesPerLine: z.number().int().min(30),
  bodyColor: z.string(),
});

// "Sprout": an original round narrator character with a leaf on its head.
// It waves hello, blinks, bounces, and its mouth moves while the words of each line appear.
const Character: React.FC<{ talking: boolean; color: string; size: number }> = ({ talking, color, size }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.12) * 4;
  const blink = frame % 95 < 5 ? 0.12 : 1;
  const mouthOpen = talking ? 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.85)) : 0;
  const wave = frame < 50 ? Math.sin(frame * 0.45) * 35 - 20 : -10 + Math.sin(frame * 0.05) * 5;
  const leaf = Math.sin(frame * 0.09) * 12;
  const brow = talking ? -3 : 0;

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: "visible" }}>
      <ellipse cx={100} cy={250} rx={60} ry={8} fill="rgba(0,0,0,0.25)" />
      <g transform={`translate(0, ${bob})`}>
        {/* leaf sprout */}
        <g transform={`rotate(${leaf} 100 72)`}>
          <path d="M100 72 C100 55 100 48 100 42" stroke="#2E7D5B" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M100 46 C 82 30, 70 40, 72 52 C 86 54, 96 50, 100 46 Z" fill="#4DFFB0" />
          <path d="M100 42 C 116 22, 132 30, 130 44 C 116 48, 106 46, 100 42 Z" fill="#3CCB8C" />
        </g>
        {/* arms */}
        <g transform={`rotate(${wave} 40 150)`}>
          <path d="M40 150 C 18 140, 10 118, 14 104" stroke={color} strokeWidth={16} fill="none" strokeLinecap="round" />
        </g>
        <path d="M160 150 C 182 150, 190 160, 194 172" stroke={color} strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* body */}
        <ellipse cx={100} cy={152} rx={72} ry={82} fill={color} />
        <ellipse cx={100} cy={178} rx={44} ry={44} fill="rgba(255,255,255,0.18)" />
        <ellipse cx={72} cy={112} rx={22} ry={12} fill="rgba(255,255,255,0.25)" transform="rotate(-25 72 112)" />
        {/* feet */}
        <ellipse cx={74} cy={232} rx={20} ry={10} fill={color} />
        <ellipse cx={126} cy={232} rx={20} ry={10} fill={color} />
        {/* brows */}
        <path d={`M62 ${100 + brow} Q76 ${92 + brow} 88 ${100 + brow}`} stroke="#1B1F2A" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M112 ${100 + brow} Q126 ${92 + brow} 140 ${100 + brow}`} stroke="#1B1F2A" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* eyes */}
        <g transform={`translate(0 ${122 * (1 - blink)}) scale(1 ${blink})`}>
          <circle cx={76} cy={122} r={15} fill="#fff" />
          <circle cx={126} cy={122} r={15} fill="#fff" />
          <circle cx={80} cy={124} r={7} fill="#1B1F2A" />
          <circle cx={130} cy={124} r={7} fill="#1B1F2A" />
          <circle cx={82} cy={121} r={2.5} fill="#fff" />
          <circle cx={132} cy={121} r={2.5} fill="#fff" />
        </g>
        {/* cheeks */}
        <circle cx={58} cy={148} r={8} fill="#FF6B8B" opacity={0.45} />
        <circle cx={144} cy={148} r={8} fill="#FF6B8B" opacity={0.45} />
        {/* mouth */}
        {mouthOpen > 0.05 ? (
          <ellipse cx={102} cy={154} rx={13} ry={3 + mouthOpen * 11} fill="#5A1A2A" />
        ) : (
          <path d="M88 150 Q102 162 116 150" stroke="#1B1F2A" strokeWidth={4} fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};

// 2D character narrator with speech bubbles — explainers, kids content, tips, channel mascot.
export const Mascot: React.FC<z.infer<typeof mascotSchema>> = ({ lines, framesPerLine, bodyColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const idx = Math.min(lines.length - 1, Math.max(0, Math.floor((frame - 20) / framesPerLine)));
  const local = frame - 20 - idx * framesPerLine;
  const words = lines[idx].split(" ");
  const revealFrames = framesPerLine * 0.6;
  const shown = frame < 20 ? 0 : Math.min(words.length, Math.floor((local / revealFrames) * words.length) + 1);
  const talking = frame >= 20 && local < revealFrames;
  const bubbleIn = spring({ frame: local, fps, config: { damping: 14 } });
  const enter = spring({ frame, fps, config: { damping: 12 } });
  const charSize = portrait ? width * 0.5 : height * 0.5;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ flexDirection: portrait ? "column-reverse" : "row", justifyContent: "center", alignItems: "center", gap: base * 0.04, padding: base * 0.06 }}>
        <div style={{ transform: `translateY(${(1 - enter) * base * 0.5}px)` }}>
          <Character talking={talking} color={bodyColor} size={charSize} />
        </div>
        <div style={{ position: "relative", maxWidth: portrait ? width * 0.85 : width * 0.45, transform: `scale(${frame >= 20 ? bubbleIn : 0})`, transformOrigin: portrait ? "50% 100%" : "0% 70%" }}>
          <div style={{ background: "#fff", borderRadius: base * 0.04, padding: `${base * 0.035}px ${base * 0.045}px`, fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.055, lineHeight: 1.3, color: "#1B1F2A", boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}>
            {words.map((w, i) => (
              <span key={i} style={{ opacity: i < shown ? 1 : 0 }}>
                {w}{" "}
              </span>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              ...(portrait
                ? { left: "50%", bottom: -base * 0.035, marginLeft: -base * 0.03, borderLeft: `${base * 0.03}px solid transparent`, borderRight: `${base * 0.03}px solid transparent`, borderTop: `${base * 0.04}px solid #fff` }
                : { left: -base * 0.035, top: "60%", borderTop: `${base * 0.03}px solid transparent`, borderBottom: `${base * 0.03}px solid transparent`, borderRight: `${base * 0.04}px solid #fff` }),
            }}
          />
          <div style={{ position: "absolute", right: base * 0.02, bottom: -base * 0.06, fontFamily: theme.fonts.body, fontSize: base * 0.025, color: theme.colors.muted, opacity: interpolate(frame, [20, 30], [0, 1], clamp) }}>
            {idx + 1}/{lines.length}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
