import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const flowchartSchema = z.object({
  title: z.string(),
  steps: z.array(z.object({ icon: z.string(), label: z.string() })).min(2).max(6),
  framesPerStep: z.number().int().positive(),
});

// Process diagram: step boxes pop in and arrows draw between them.
// Horizontal in landscape, vertical in portrait.
export const Flowchart: React.FC<z.infer<typeof flowchartSchema>> = ({ title, steps, framesPerStep }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const n = steps.length;
  const box = portrait ? Math.min(base * 0.32, (height * 0.7) / (n * 1.45)) : Math.min(base * 0.3, (width * 0.85) / (n * 1.45));
  const arrowLen = box * 0.45;
  const color = (i: number) => [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D"][i % 6];

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.07, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text, opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>{title}</div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: portrait ? "column" : "row", paddingTop: base * 0.1 }}>
        {steps.map((s, i) => {
          const at = 10 + i * framesPerStep;
          const pop = spring({ frame: frame - at, fps, config: { damping: 12 } });
          const draw = interpolate(frame, [at + 8, at + framesPerStep], [0, 1], clamp);
          return (
            <div key={i} style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center" }}>
              <div style={{ width: box, height: box, borderRadius: box * 0.18, background: `${color(i)}22`, border: `${Math.max(3, box * 0.025)}px solid ${color(i)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: box * 0.05, transform: `scale(${pop})`, padding: box * 0.06, textAlign: "center" }}>
                <div style={{ fontSize: box * 0.32 }}>{s.icon}</div>
                <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: box * 0.12, color: theme.colors.text, lineHeight: 1.1 }}>{s.label}</div>
              </div>
              {i < n - 1 && (
                <div style={{ width: portrait ? box * 0.1 : arrowLen, height: portrait ? arrowLen : box * 0.1, display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: "flex-start" }}>
                  <div style={{ background: theme.colors.text, width: portrait ? box * 0.025 : arrowLen * 0.8 * draw, height: portrait ? arrowLen * 0.8 * draw : box * 0.025, borderRadius: 99 }} />
                  <div style={{ width: 0, height: 0, opacity: draw > 0.95 ? 1 : 0, ...(portrait
                    ? { borderLeft: `${box * 0.06}px solid transparent`, borderRight: `${box * 0.06}px solid transparent`, borderTop: `${box * 0.08}px solid ${theme.colors.text}` }
                    : { borderTop: `${box * 0.06}px solid transparent`, borderBottom: `${box * 0.06}px solid transparent`, borderLeft: `${box * 0.08}px solid ${theme.colors.text}` }) }} />
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
