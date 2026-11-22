import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const listRevealSchema = z.object({
  title: z.string(),
  items: z.array(z.object({ icon: z.string(), text: z.string() })),
  countdown: z.boolean(),
  framesPerItem: z.number().int().positive(),
});

// "Top N" listicle: items slide in one at a time; countdown numbers them N..1.
export const ListReveal: React.FC<z.infer<typeof listRevealSchema>> = ({ title, items, countdown, framesPerItem }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ padding: base * 0.08, justifyContent: "center", gap: base * 0.025 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.075, color: theme.colors.text, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
          {title}
        </div>
        {items.map((item, i) => {
          const p = spring({ frame: frame - 15 - i * framesPerItem, fps, config: { damping: 15 } });
          const n = countdown ? items.length - i : i + 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: base * 0.03,
                background: `${theme.colors.surface}DD`,
                borderLeft: `${base * 0.01}px solid ${i % 2 ? theme.colors.secondary : theme.colors.primary}`,
                borderRadius: base * 0.02,
                padding: `${base * 0.02}px ${base * 0.03}px`,
                transform: `translateX(${interpolate(p, [0, 1], [-base, 0])}px)`,
                opacity: p,
              }}
            >
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.06, color: theme.colors.accent, width: base * 0.08 }}>{n}</div>
              <div style={{ fontSize: base * 0.055 }}>{item.icon}</div>
              <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.045, color: theme.colors.text }}>{item.text}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
