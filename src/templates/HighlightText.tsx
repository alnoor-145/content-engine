import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const highlightTextSchema = z.object({
  text: z.string(),
  // Words to mark with a highlighter sweep, in order.
  highlights: z.array(z.string()),
});

const clean = (w: string) => w.replace(/[.,!?;:"'“”।]/g, "").toLowerCase();

// Sentence fades in word by word, then a marker sweeps behind the key words. Great for education.
export const HighlightText: React.FC<z.infer<typeof highlightTextSchema>> = ({ text, highlights }) => {
  const frame = useCurrentFrame();
  const base = useBase();
  const words = text.split(" ");
  const keys = highlights.map(clean);
  const sweepStart = 10 + words.length * 3 + 5;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${base * 0.012}px ${base * 0.02}px`, maxWidth: "100%" }}>
          {words.map((w, i) => {
            const k = keys.indexOf(clean(w));
            const inP = interpolate(frame, [10 + i * 3, 18 + i * 3], [0, 1], clamp);
            const sweep = k >= 0 ? interpolate(frame, [sweepStart + k * 12, sweepStart + k * 12 + 12], [0, 100], clamp) : 0;
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.fonts.heading,
                  fontWeight: 800,
                  fontSize: base * 0.075,
                  lineHeight: 1.25,
                  color: k >= 0 && sweep > 50 ? theme.colors.background : theme.colors.text,
                  opacity: inP,
                  transform: `translateY(${(1 - inP) * base * 0.03}px)`,
                  padding: `0 ${base * 0.008}px`,
                  backgroundImage: `linear-gradient(${theme.colors.accent}, ${theme.colors.accent})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "0 85%",
                  backgroundSize: `${sweep}% 80%`,
                  borderRadius: base * 0.008,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
