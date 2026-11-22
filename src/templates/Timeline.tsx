import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const timelineSchema = z.object({
  title: z.string(),
  events: z.array(z.object({ date: z.string(), text: z.string() })),
  framesPerEvent: z.number().int().positive(),
});

// Vertical timeline: the spine draws down and each event pops in on its dot.
export const Timeline: React.FC<z.infer<typeof timelineSchema>> = ({ title, events, framesPerEvent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const total = events.length * framesPerEvent;
  const spine = interpolate(frame, [10, 10 + total], [0, 100], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ padding: base * 0.08, justifyContent: "center" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text, marginBottom: base * 0.04 }}>{title}</div>
        <div style={{ position: "relative", paddingLeft: base * 0.08 }}>
          <div style={{ position: "absolute", left: base * 0.025, top: 0, width: base * 0.008, height: `${spine}%`, background: `linear-gradient(${theme.colors.primary}, ${theme.colors.secondary})`, borderRadius: 99 }} />
          {events.map((e, i) => {
            const p = spring({ frame: frame - 10 - i * framesPerEvent, fps, config: { damping: 14 } });
            return (
              <div key={i} style={{ position: "relative", marginBottom: base * 0.04, opacity: p, transform: `translateX(${(1 - p) * base * 0.05}px)` }}>
                <div style={{ position: "absolute", left: -base * 0.072, top: base * 0.008, width: base * 0.04, height: base * 0.04, borderRadius: "50%", background: theme.colors.accent, transform: `scale(${p})` }} />
                <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.045, color: theme.colors.accent }}>{e.date}</div>
                <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.04, color: theme.colors.text }}>{e.text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
