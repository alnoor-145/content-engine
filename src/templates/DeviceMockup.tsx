import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const deviceMockupSchema = z.object({
  appTitle: z.string(),
  feed: z.array(z.string()).min(1),
  caption: z.string(),
});

// 3D phone mockup: the phone swings in from an angle, its screen scrolls through an app feed.
// Use for app reviews, "how to" tutorials and website/app showcases.
export const DeviceMockup: React.FC<z.infer<typeof deviceMockupSchema>> = ({ appTitle, feed, caption }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const ph = portrait ? height * 0.72 : height * 0.82;
  const pw = ph * 0.49;
  const enter = spring({ frame, fps, config: { damping: 20 } });
  const rotY = interpolate(enter, [0, 1], [-55, -18]) + Math.sin(frame * 0.03) * 6;
  const rotX = interpolate(enter, [0, 1], [25, 6]);
  const cardH = ph * 0.2;
  const scroll = interpolate(frame, [40, 40 + feed.length * 25], [0, Math.max(0, feed.length * (cardH + ph * 0.025) - ph * 0.6)], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0"];
  const depth = 14;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ flexDirection: portrait ? "column" : "row", justifyContent: "center", alignItems: "center", gap: base * 0.08, perspective: base * 3 }}>
        <div style={{ position: "relative", width: pw, height: ph, transformStyle: "preserve-3d", transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${0.6 + 0.4 * enter})` }}>
          {Array.from({ length: depth }).map((_, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, borderRadius: pw * 0.14, background: i === depth - 1 ? "#2A2F45" : "#1A1E2E", transform: `translateZ(${-i * (pw * 0.006)}px)` }} />
          ))}
          <div style={{ position: "absolute", inset: pw * 0.035, borderRadius: pw * 0.11, background: "#0B0F1A", overflow: "hidden", transform: "translateZ(1px)" }}>
            <div style={{ position: "absolute", top: ph * 0.015, left: "50%", width: pw * 0.3, height: ph * 0.025, marginLeft: -pw * 0.15, borderRadius: 999, background: "#000", zIndex: 2 }} />
            <div style={{ position: "relative", zIndex: 1, padding: `${ph * 0.06}px ${pw * 0.06}px ${ph * 0.02}px`, fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: pw * 0.08, color: theme.colors.text, background: theme.colors.surface }}>{appTitle}</div>
            <div style={{ padding: pw * 0.05, display: "flex", flexDirection: "column", gap: ph * 0.025, transform: `translateY(${-scroll}px)` }}>
              {feed.map((f, i) => (
                <div key={i} style={{ height: cardH, borderRadius: pw * 0.05, background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]}88)`, display: "flex", alignItems: "flex-end", padding: pw * 0.05, fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: pw * 0.065, color: "#fff" }}>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${110 + rotY}deg, rgba(255,255,255,0.18) 0%, transparent 35%)`, pointerEvents: "none" }} />
          </div>
        </div>
        <div style={{ maxWidth: portrait ? width * 0.85 : width * 0.35, textAlign: portrait ? "center" : "left", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text, opacity: interpolate(frame, [20, 40], [0, 1], clamp) }}>
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
