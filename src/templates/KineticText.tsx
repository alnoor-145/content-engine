import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";

export const kineticTextSchema = z.object({
  lines: z.array(z.string()),
  framesPerLine: z.number().int().positive(),
});

export type KineticTextProps = z.infer<typeof kineticTextSchema>;

// Kinetic typography: one line at a time, each word springs in with a stagger.
export const KineticText: React.FC<KineticTextProps> = ({ lines, framesPerLine }) => (
  <AbsoluteFill>
    <Background />
    {lines.map((line, i) => (
      <Sequence key={i} from={i * framesPerLine} durationInFrames={framesPerLine}>
        <Line text={line} highlight={i % 2 === 0 ? theme.colors.primary : theme.colors.secondary} duration={framesPerLine} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const Line: React.FC<{ text: string; highlight: string; duration: number }> = ({ text, highlight, duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);
  const words = text.split(" ");
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.08, opacity: exit }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${base * 0.025}px` }}>
        {words.map((word, i) => {
          const p = spring({ frame: frame - i * 4, fps, config: { damping: 14 } });
          const isKey = i === words.length - 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: 800,
                fontSize: base * 0.1,
                color: isKey ? highlight : theme.colors.text,
                display: "inline-block",
                transform: `translateY(${interpolate(p, [0, 1], [base * 0.08, 0])}px) rotate(${interpolate(p, [0, 1], [8, 0])}deg)`,
                opacity: p,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
