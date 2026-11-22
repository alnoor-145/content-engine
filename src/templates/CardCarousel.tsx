import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const cardCarouselSchema = z.object({
  title: z.string(),
  cards: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })).min(3).max(10),
  framesPerCard: z.number().int().min(20),
});

const COLORS = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", "#FF9F4D"];

// 3D carousel: cards on a rotating ring; it stops on each card in turn and brings it to the front.
// Great for "Top N", features, tips and product lineups. Works with Bangla text.
export const CardCarousel: React.FC<z.infer<typeof cardCarouselSchema>> = ({ title, cards, framesPerCard }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const n = cards.length;
  const cardW = portrait ? width * 0.55 : base * 0.42;
  const cardH = cardW * 1.3;
  const radius = (cardW * 1.15) / (2 * Math.tan(Math.PI / n));
  const step = Math.floor((frame - 15) / framesPerCard);
  const turn = Array.from({ length: Math.max(0, step + 1) }).reduce<number>((acc, _, s) => acc + (s === 0 ? 0 : spring({ frame: frame - 15 - s * framesPerCard, fps, config: { damping: 16 } })), 0);
  const angle = -(turn * 360) / n;
  const active = ((Math.round(turn) % n) + n) % n;
  const enter = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: base * 0.06, width: "100%", textAlign: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text, opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>{title}</div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: base * 2.5, paddingTop: base * 0.08 }}>
        <div style={{ position: "relative", width: cardW, height: cardH, transformStyle: "preserve-3d", transform: `translateZ(${-radius}px) rotateX(-6deg) rotateY(${angle}deg) scale(${enter})` }}>
          {cards.map((c, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${(i * 360) / n}deg) translateZ(${radius}px)`,
                  borderRadius: cardW * 0.08,
                  background: `linear-gradient(160deg, ${COLORS[i % COLORS.length]}, ${theme.colors.surface} 75%)`,
                  border: `${Math.max(2, base * 0.003)}px solid ${isActive ? "#fff" : "rgba(255,255,255,0.15)"}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: cardW * 0.08,
                  gap: cardW * 0.03,
                  boxShadow: isActive ? `0 0 ${base * 0.06}px ${COLORS[i % COLORS.length]}88` : "none",
                  filter: isActive ? "none" : "brightness(0.55)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div style={{ fontSize: cardW * 0.28, lineHeight: 1 }}>{c.icon}</div>
                <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: cardW * 0.1, color: "#fff", lineHeight: 1.1 }}>{c.title}</div>
                <div style={{ fontFamily: theme.fonts.body, fontSize: cardW * 0.06, color: "rgba(255,255,255,0.8)", lineHeight: 1.3 }}>{c.text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
