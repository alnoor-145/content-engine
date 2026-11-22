import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const typewriterSchema = z.object({
  prompt: z.string(),
  text: z.string(),
  charsPerFrame: z.number().positive(),
});

// Terminal-style typing with a blinking cursor.
export const Typewriter: React.FC<z.infer<typeof typewriterSchema>> = ({ prompt, text, charsPerFrame }) => {
  const frame = useCurrentFrame();
  const base = useBase();
  const shown = text.slice(0, Math.floor(frame * charsPerFrame));
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.08 }}>
        <div
          style={{
            width: "100%",
            background: `${theme.colors.surface}EE`,
            borderRadius: base * 0.025,
            padding: base * 0.05,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontSize: base * 0.05,
            color: theme.colors.text,
            whiteSpace: "pre-wrap",
            boxShadow: `0 0 ${base * 0.08}px ${theme.colors.secondary}33`,
          }}
        >
          <span style={{ color: theme.colors.secondary }}>{prompt} </span>
          {shown}
          <span style={{ opacity: cursorOn ? 1 : 0, color: theme.colors.primary }}>▌</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
