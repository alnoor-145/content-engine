import katex from "katex";
import "katex/dist/katex.min.css";
import { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const equationSchema = z.object({
  title: z.string(),
  // Each step is LaTeX, e.g. "a^2 + b^2 = c^2".
  steps: z.array(z.string()).min(1),
  framesPerStep: z.number().int().positive(),
  caption: z.string(),
});

// Wait for KaTeX's math fonts so no frame renders with fallback glyphs.
const useKatexFonts = () => {
  const [handle] = useState(() => delayRender("Loading KaTeX fonts"));
  useEffect(() => {
    Promise.all(["KaTeX_Main", "KaTeX_Math", "KaTeX_Size1", "KaTeX_Size2"].map((f) => document.fonts.load(`40px ${f}`)))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

// Step-by-step math derivation (3Blue1Brown-lite): each line appears, earlier lines dim and move up.
export const Equation: React.FC<z.infer<typeof equationSchema>> = ({ title, steps, framesPerStep, caption }) => {
  useKatexFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const current = Math.min(steps.length - 1, Math.max(0, Math.floor((frame - 10) / framesPerStep)));
  const lineH = base * 0.13;

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.07, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.06, color: theme.colors.text }}>{title}</div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%", height: lineH }}>
          {steps.map((s, i) => {
            if (i > current) return null;
            const p = spring({ frame: frame - 10 - i * framesPerStep, fps, config: { damping: 14 } });
            const age = current - i; // 0 = newest
            const y = -age * lineH * 0.9;
            const isNew = age === 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: y + (1 - p) * lineH * 0.6,
                  textAlign: "center",
                  color: isNew ? theme.colors.text : theme.colors.muted,
                  fontSize: isNew ? base * 0.075 : base * 0.05,
                  // Show the newest line plus at most two previous ones, so the stack never reaches the title.
                  opacity: isNew ? p : age === 1 ? 0.55 : age === 2 ? 0.28 : 0,
                  transition: "none",
                }}
                dangerouslySetInnerHTML={{ __html: katex.renderToString(s, { throwOnError: false, displayMode: false }) }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: base * 0.08, width: "100%", textAlign: "center", fontFamily: theme.fonts.body, fontSize: base * 0.04, color: theme.colors.accent, opacity: interpolate(frame, [10 + (steps.length - 1) * framesPerStep + 15, 10 + (steps.length - 1) * framesPerStep + 30], [0, 1], clamp) }}>
        {caption}
      </div>
    </AbsoluteFill>
  );
};
