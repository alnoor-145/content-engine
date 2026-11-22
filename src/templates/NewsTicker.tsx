import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const newsTickerSchema = z.object({
  label: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  tickerItems: z.array(z.string()),
  tickerSpeed: z.number().positive(),
});

// Breaking-news package: label + headline bar wipe in, with a scrolling ticker along the bottom.
export const NewsTicker: React.FC<z.infer<typeof newsTickerSchema>> = ({ label, headline, subheadline, tickerItems, tickerSpeed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const labelIn = spring({ frame, fps, config: { damping: 200 } });
  const barIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const subIn = interpolate(frame, [20, 32], [0, 1], clamp);
  const tickerH = base * 0.075;
  const tickerText = tickerItems.join("   •   ") + "   •   ";
  const blockY = height - tickerH - base * 0.32;

  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: base * 0.05, top: blockY, display: "flex", flexDirection: "column", alignItems: "flex-start", width: width - base * 0.1 }}>
        <div style={{ background: "#E50914", color: "#fff", fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.04, padding: `${base * 0.008}px ${base * 0.025}px`, transform: `translateX(${(labelIn - 1) * base * 0.6}px)`, letterSpacing: base * 0.002 }}>
          {label}
        </div>
        <div style={{ background: "#fff", overflow: "hidden", clipPath: `inset(0 ${(1 - barIn) * 100}% 0 0)`, padding: `${base * 0.015}px ${base * 0.025}px`, maxWidth: "100%" }}>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.055, color: "#0B0F1A", lineHeight: 1.15 }}>{headline}</div>
        </div>
        <div style={{ background: "rgba(11,15,26,0.85)", color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: base * 0.032, padding: `${base * 0.01}px ${base * 0.025}px`, opacity: subIn }}>{subheadline}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: tickerH, background: "#0B0F1A", borderTop: `${base * 0.005}px solid #E50914`, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ height: "100%", display: "flex", alignItems: "center", background: "#E50914", color: "#fff", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.03, padding: `0 ${base * 0.02}px`, zIndex: 1, flexShrink: 0 }}>LIVE</div>
        <div style={{ whiteSpace: "nowrap", fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.034, color: theme.colors.text, transform: `translateX(${width - frame * tickerSpeed * (base / 1080)}px)` }}>
          {tickerText.repeat(4)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
