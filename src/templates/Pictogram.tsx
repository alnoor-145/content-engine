import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const pictogramSchema = z.object({
  title: z.string(),
  total: z.number().int().min(4).max(200),
  highlighted: z.number().int().min(0),
  caption: z.string(),
});

const Person: React.FC<{ size: number; color: string; scale: number }> = ({ size, color, scale }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ transform: `scale(${scale})` }}>
    <circle cx={10} cy={5} r={3.6} fill={color} />
    <path d="M3.5 19 C3.5 12.5 6 10 10 10 C14 10 16.5 12.5 16.5 19 Z" fill={color} />
  </svg>
);

// Icon array ("1 in 4 people…"): a grid of people fills in, one by one, in the accent color.
export const Pictogram: React.FC<z.infer<typeof pictogramSchema>> = ({ title, total, highlighted, caption }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const gridSize = portrait ? width * 0.85 : height * 0.7;
  const cell = gridSize / Math.max(cols, rows);
  // Fill all highlighted icons over ~50 frames, whatever the count.
  const per = 50 / Math.max(highlighted, 1);
  const shownCount = Math.min(highlighted, Math.floor(interpolate(frame, [20, 70], [0, highlighted], clamp)));

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ flexDirection: portrait ? "column" : "row", justifyContent: "center", alignItems: "center", gap: base * 0.07, padding: base * 0.06 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
          {Array.from({ length: total }).map((_, i) => {
            const on = i < highlighted;
            const pop = spring({ frame: frame - (i % cols) - Math.floor(i / cols), fps, config: { damping: 14 } });
            const lit = on && i < shownCount;
            const litPop = lit ? spring({ frame: frame - 20 - i * per, fps, config: { damping: 8 } }) : 0;
            return <Person key={i} size={cell} color={lit ? theme.colors.primary : "rgba(255,255,255,0.18)"} scale={pop * (lit ? 0.85 + 0.15 * litPop : 0.85)} />;
          })}
        </div>
        <div style={{ maxWidth: portrait ? "100%" : width * 0.4, textAlign: portrait ? "center" : "left" }}>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.16, color: theme.colors.primary, lineHeight: 1 }}>
            {shownCount}
            <span style={{ fontSize: base * 0.06, color: theme.colors.muted }}> / {total}</span>
          </div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.055, color: theme.colors.text, marginTop: base * 0.02 }}>{title}</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted, marginTop: base * 0.015, opacity: interpolate(frame, [70, 85], [0, 1], clamp) }}>{caption}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
