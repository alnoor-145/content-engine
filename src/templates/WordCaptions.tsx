import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const wordCaptionsSchema = z.object({
  // Word timings in milliseconds, like an SRT/Whisper export converted to words.
  words: z.array(z.object({ text: z.string(), startMs: z.number(), endMs: z.number() })),
  wordsPerPage: z.number().int().positive(),
});

// Short/Reel style captions: pages of a few words, the active word pops and highlights.
export const WordCaptions: React.FC<z.infer<typeof wordCaptionsSchema>> = ({ words, wordsPerPage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const ms = (frame / fps) * 1000;

  const activeIndex = Math.max(0, words.findIndex((w) => ms >= w.startMs && ms < w.endMs));
  const pageStart = Math.floor(activeIndex / wordsPerPage) * wordsPerPage;
  const page = words.slice(pageStart, pageStart + wordsPerPage);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.08 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: base * 0.025 }}>
          {page.map((w, i) => {
            const idx = pageStart + i;
            const active = idx === activeIndex;
            const pop = spring({ frame: frame - Math.round((w.startMs / 1000) * fps), fps, config: { damping: 12 } });
            return (
              <span
                key={idx}
                style={{
                  fontFamily: theme.fonts.heading,
                  fontWeight: 900,
                  fontSize: base * 0.1,
                  textTransform: "uppercase",
                  color: active ? theme.colors.background : theme.colors.text,
                  background: active ? theme.colors.accent : "transparent",
                  padding: `0 ${base * 0.015}px`,
                  borderRadius: base * 0.015,
                  transform: `scale(${active ? 0.9 + 0.15 * pop : 1})`,
                  WebkitTextStroke: active ? undefined : `${base * 0.004}px #000`,
                  opacity: ms >= w.startMs ? 1 : 0.35,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
