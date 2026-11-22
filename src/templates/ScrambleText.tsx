import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { graphemes, isBangla } from "../lib/text";
import { clamp, useBase } from "../lib/useBase";

export const scrambleTextSchema = z.object({
  lines: z.array(z.string()),
  framesPerLine: z.number().int().positive(),
});

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@!?";
const BANGLA = "অআইউএওকখগঘচছজঝটঠডঢতথদধনপফবভমযরলশসহ০১২৩৪৫৬৭৮৯";

const Line: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const base = useBase();
  const chars = graphemes(text);
  const pool = isBangla(text) ? BANGLA : LATIN;
  const out = interpolate(frame, [duration - 8, duration], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.08, opacity: out }}>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.09, color: theme.colors.text, textAlign: "center" }}>
        {chars.map((c, i) => {
          const settle = 4 + i * 1.6;
          if (c === " " || frame >= settle) return <span key={i}>{c}</span>;
          const r = Math.floor(random(`${text}-${i}-${Math.floor(frame / 2)}`) * pool.length);
          return (
            <span key={i} style={{ color: theme.colors.secondary, opacity: frame < settle - 12 ? 0.35 : 0.9 }}>
              {Array.from(pool)[r % Array.from(pool).length]}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Hacker-style decode: each character cycles through random glyphs then locks in. Works with Bangla too.
export const ScrambleText: React.FC<z.infer<typeof scrambleTextSchema>> = ({ lines, framesPerLine }) => (
  <AbsoluteFill>
    <Background />
    {lines.map((l, i) => (
      <Sequence key={i} from={i * framesPerLine} durationInFrames={framesPerLine}>
        <Line text={l} duration={framesPerLine} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
