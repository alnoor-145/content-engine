import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const subscribeCtaSchema = z.object({
  channelName: z.string(),
  tagline: z.string(),
  subscribeText: z.string(),
  subscribedText: z.string(),
  likeText: z.string(),
});

// Cursor path in the card's 800x450 design space: [frame, x, y].
const PATH: [number, number, number][] = [
  [20, 900, 560],
  [40, 160, 305], // like
  [62, 455, 305], // subscribe
  [84, 690, 305], // bell
  [110, 760, 420],
];

const cursorAt = (f: number) => {
  for (let i = 0; i < PATH.length - 1; i++) {
    const [f0, x0, y0] = PATH[i];
    const [f1, x1, y1] = PATH[i + 1];
    if (f <= f1) {
      const t = interpolate(f, [f0, f1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  return [PATH.at(-1)![1], PATH.at(-1)![2]];
};

// "Like + Subscribe + Bell" call-to-action with an animated cursor clicking each button.
export const SubscribeCTA: React.FC<z.infer<typeof subscribeCtaSchema>> = ({ channelName, tagline, subscribeText, subscribedText, likeText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const s = (base * 0.85) / 800; // design-unit scale

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const liked = frame >= 44;
  const subscribed = frame >= 66;
  const belled = frame >= 88;
  const pressScale = (at: number) => (frame >= at && frame < at + 5 ? 0.9 : 1);
  const likePop = spring({ frame: frame - 44, fps, config: { damping: 8 } });
  const ring = belled ? Math.sin((frame - 88) * 0.9) * 25 * Math.max(0, 1 - (frame - 88) / 30) : 0;
  const [cx, cy] = cursorAt(frame);
  const cursorClick = [42, 64, 86].some((f) => frame >= f && frame < f + 5) ? 0.8 : 1;

  const btn = (x: number, w: number, bg: string, scale: number): React.CSSProperties => ({
    position: "absolute",
    left: x,
    top: 260,
    width: w,
    height: 90,
    borderRadius: 45,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    fontFamily: theme.fonts.heading,
    fontWeight: 700,
    fontSize: 34,
    color: "#fff",
    transform: `scale(${scale})`,
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 800, height: 450, position: "relative", transform: `scale(${s * enter})`, opacity: enter }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }} />
          <div style={{ position: "absolute", left: 50, top: 60, width: 120, height: 120, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: 60, color: "#fff" }}>
            {channelName.trim().charAt(0).toUpperCase()}
          </div>
          <div style={{ position: "absolute", left: 200, top: 70, fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: 48, color: theme.colors.text }}>{channelName}</div>
          <div style={{ position: "absolute", left: 200, top: 135, fontFamily: theme.fonts.body, fontSize: 28, color: theme.colors.muted }}>{tagline}</div>

          <div style={btn(60, 200, liked ? theme.colors.secondary : "#2A3048", pressScale(42))}>
            <span style={{ transform: `scale(${liked ? 1 + 0.4 * (1 - likePop) + 0.0 : 1})` }}>👍</span>
            {likeText}
          </div>
          <div style={btn(290, 330, subscribed ? "#3A3F52" : "#FF0000", pressScale(64))}>{subscribed ? `✓ ${subscribedText}` : subscribeText}</div>
          <div style={{ ...btn(645, 90, belled ? theme.colors.accent : "#2A3048", pressScale(86)), fontSize: 40 }}>
            <span style={{ display: "inline-block", transform: `rotate(${ring}deg)`, transformOrigin: "50% 10%" }}>🔔</span>
          </div>

          <svg width={56} height={56} viewBox="0 0 24 24" style={{ position: "absolute", left: cx - 8, top: cy - 4, transform: `scale(${cursorClick})`, transformOrigin: "0 0", opacity: interpolate(frame, [15, 22], [0, 1], clamp), filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}>
            <path d="M3 2 L3 19 L7.5 14.5 L10.5 21 L13.5 19.7 L10.6 13.3 L17 13.3 Z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
