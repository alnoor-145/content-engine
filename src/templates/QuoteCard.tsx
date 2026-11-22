import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const quoteCardSchema = z.object({
  quote: z.string(),
  author: z.string(),
});

// Glassmorphism quote card: card rises, words fade in one by one, author slides in.
export const QuoteCard: React.FC<z.infer<typeof quoteCardSchema>> = ({ quote, author }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  const words = quote.split(" ");
  const authorIn = interpolate(frame, [10 + words.length * 3, 25 + words.length * 3], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.07 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            borderRadius: base * 0.04,
            padding: base * 0.07,
            transform: `translateY(${interpolate(rise, [0, 1], [base * 0.1, 0])}px)`,
            opacity: rise,
          }}
        >
          <div style={{ fontSize: base * 0.18, lineHeight: 0.6, color: theme.colors.primary, fontFamily: "Georgia, serif" }}>“</div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.065, lineHeight: 1.25, color: theme.colors.text }}>
            {words.map((w, i) => (
              <span key={i} style={{ opacity: interpolate(frame, [10 + i * 3, 18 + i * 3], [0, 1], clamp) }}>
                {w}{" "}
              </span>
            ))}
          </div>
          <div
            style={{
              marginTop: base * 0.04,
              fontFamily: theme.fonts.body,
              fontSize: base * 0.04,
              color: theme.colors.secondary,
              opacity: authorIn,
              transform: `translateX(${interpolate(authorIn, [0, 1], [-base * 0.05, 0])}px)`,
            }}
          >
            — {author}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
