import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const endScreenSchema = z.object({
  heading: z.string(),
  channelName: z.string(),
  videoLabels: z.array(z.string()).max(2),
  ctaText: z.string(),
  accentColor: z.string(),
});

// YouTube end screen: leaves clean placeholder slots where YouTube overlays
// your "next video" and "subscribe" elements (add them in YouTube Studio).
export const EndScreen: React.FC<z.infer<typeof endScreenSchema>> = ({ heading, channelName, videoLabels, ctaText, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  // In portrait the heading, two cards and the avatar block stack vertically: size the cards to fit what's left.
  const stackFixed = base * 0.6; // heading + avatar + name + button + gaps
  const cardW = portrait ? Math.min(width * 0.8, (((height * 0.92 - stackFixed) / 2) * 16) / 9) : width * 0.3;
  const cardH = (cardW * 9) / 16;
  const pulse = 1 + 0.04 * Math.sin(frame * 0.12);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: base * 0.05 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text, opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>{heading}</div>
        <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: base * 0.05 }}>
          {videoLabels.map((label, i) => {
            const p = spring({ frame: frame - 8 - i * 8, fps, config: { damping: 14 } });
            return (
              <div key={i} style={{ width: cardW, height: cardH, borderRadius: base * 0.02, border: `${Math.max(2, base * 0.004)}px dashed rgba(255,255,255,0.35)`, background: "rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: base * 0.01, transform: `scale(${p})`, opacity: p }}>
                <div style={{ fontSize: base * 0.06, color: theme.colors.primary }}>▶</div>
                <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.03, color: theme.colors.muted }}>{label}</div>
              </div>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: base * 0.015 }}>
            <div style={{ width: base * 0.2, height: base * 0.2, borderRadius: "50%", border: `${base * 0.008}px solid ${accentColor}`, transform: `scale(${spring({ frame: frame - 24, fps, config: { damping: 10 } }) * pulse})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: theme.colors.text, background: `${accentColor}1F` }}>
              {channelName.trim().charAt(0).toUpperCase()}
            </div>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.04, color: theme.colors.text, opacity: interpolate(frame, [26, 36], [0, 1], clamp) }}>{channelName}</div>
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.035, color: "#fff", background: accentColor, padding: `${base * 0.008}px ${base * 0.03}px`, borderRadius: 999, opacity: interpolate(frame, [30, 40], [0, 1], clamp) }}>
              {ctaText}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
