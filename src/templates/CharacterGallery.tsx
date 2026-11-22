import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";
import { Character, RIG_HEIGHT, TYPE_SCALE, TYPE_WIDTH, lookSchema, type Emotion, type Gesture } from "../story/Character";
import { visemeFor } from "../story/speech";

export const characterGallerySchema = z.object({
  title: z.string(),
  characters: z.array(lookSchema).min(1),
  // Seconds each character is in the spotlight (talking + gesturing).
  spotlightSeconds: z.number().positive(),
});

const ACTIONS: Gesture[] = ["wave", "cheer", "explain", "point"];
const MOODS: Emotion[] = ["happy", "surprised", "happy", "neutral"];

// "Meet the cast": every character on a stage; one by one each steps into the spotlight, waves,
// talks (mouth moves) and shows an emotion while its name card pops up.
export const CharacterGallery: React.FC<z.infer<typeof characterGallerySchema>> = ({ title, characters, spotlightSeconds }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const t = frame / fps;
  const n = characters.length;
  const cols = portrait ? 4 : Math.ceil(n / 2);
  const rows = Math.ceil(n / cols);
  const cellW = (w * 0.94) / cols;
  const top = h * (portrait ? 0.2 : 0.2);
  const rowH = (h * (portrait ? 0.74 : 0.76)) / rows;
  const charPx = Math.min(rowH * 0.78, cellW * 1.25);
  const active = Math.floor(t / spotlightSeconds) % n;
  const local = t - Math.floor(t / spotlightSeconds) * spotlightSeconds;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #2A2F5A, #0B0F1A 75%)`, overflow: "hidden" }}>
      {/* stage lights */}
      {[0.15, 0.5, 0.85].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: -h * 0.1, width: w * 0.3, height: h * 1.2, marginLeft: -w * 0.15, background: `linear-gradient(${["#FF4D6D", "#FFD84D", "#4DD4FF"][i]}22, transparent 70%)`, transform: `rotate(${Math.sin(t * 0.6 + i * 2) * 10}deg)`, transformOrigin: "50% 0%", filter: `blur(${base * 0.02}px)` }} />
      ))}
      <div style={{ position: "absolute", top: base * 0.04, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.075, color: "#fff", opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>{title}</div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {characters.map((look, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const inRow = Math.min(cols, n - r * cols);
          const x = w * 0.03 + cellW * (c + 0.5) + ((cols - inRow) * cellW) / 2;
          const y = top + rowH * (r + 1) - rowH * 0.08;
          const on = i === active;
          const pop = spring({ frame: frame - 6 - i * 3, fps, config: { damping: 12 } });
          const hop = on ? spring({ frame: Math.round(local * fps), fps, config: { damping: 9 } }) : 0;
          const talkPhase = local * 9;
          const mouth = on && local > 0.4 && local < spotlightSeconds - 0.3 ? 0.15 + 0.85 * Math.abs(Math.sin(talkPhase)) : 0;
          const fit = Math.min(TYPE_SCALE[look.type], (cellW * 0.92) / ((charPx / RIG_HEIGHT) * TYPE_WIDTH[look.type]));
          const s = (charPx / RIG_HEIGHT) * fit * (on ? 1.12 : 1) * pop;
          const period = 90 + Math.floor(random(`b${i}`) * 60);
          const ph = (frame + i * 17) % period;
          const blink = ph < 2 ? 1 : ph < 4 ? 0.5 : 0;
          const facing = c < cols / 2 ? 1 : -1;
          return (
            <g key={look.id} transform={`translate(${x} ${y - hop * base * 0.02})`} opacity={on || active < 0 ? 1 : 0.8}>
              <ellipse cx={0} cy={0} rx={charPx * 0.22} ry={charPx * 0.035} fill={on ? `${look.color}66` : "rgba(0,0,0,0.35)"} />
              {on && <ellipse cx={0} cy={0} rx={charPx * 0.32} ry={charPx * 0.06} fill="none" stroke={look.color} strokeWidth={base * 0.003} opacity={0.8} />}
              <g transform={`scale(${s * facing} ${s})`}>
                <Character
                  look={look}
                  pose={{
                    t: t + i * 1.3,
                    mouth,
                    viseme: visemeFor(mouth, `${i}-${Math.floor(talkPhase / Math.PI)}`),
                    blink,
                    emotion: on ? MOODS[i % MOODS.length] : "neutral",
                    gesture: on ? ACTIONS[i % ACTIONS.length] : "none",
                    walking: false,
                    walkPhase: 0,
                    lookX: on ? 0.6 : 0.2,
                    talking: mouth > 0,
                  }}
                />
              </g>
            </g>
          );
        })}
      </svg>
      {/* name cards */}
      {characters.map((look, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const inRow = Math.min(cols, n - r * cols);
        const x = w * 0.03 + cellW * (c + 0.5) + ((cols - inRow) * cellW) / 2;
        const y = top + rowH * (r + 1) - rowH * 0.08;
        const on = i === active;
        const pop = spring({ frame: Math.round(local * fps) - 4, fps, config: { damping: 12 } });
        return (
          <div key={look.id} style={{ position: "absolute", left: x, top: y + base * 0.012, transform: `translateX(-50%) scale(${on ? 1 + 0.12 * pop : 1})`, fontFamily: theme.fonts.bangla, fontWeight: 700, fontSize: base * (on ? 0.034 : 0.024), color: on ? "#1B1F2A" : "#fff", background: on ? look.color : "rgba(0,0,0,0.45)", padding: `${base * 0.003}px ${base * 0.014}px`, borderRadius: 999, whiteSpace: "nowrap", boxShadow: on ? `0 0 ${base * 0.03}px ${look.color}` : "none" }}>
            {look.name}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
