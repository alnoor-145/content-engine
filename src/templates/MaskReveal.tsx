import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const maskRevealSchema = z.object({
  kicker: z.string(),
  lines: z.array(z.string()),
});

const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

// One line revealed by a sweeping color block: block wipes in, text appears, block wipes out.
const RevealLine: React.FC<{ text: string; delay: number; color: string; size: number; weight: number; textColor: string }> = ({ text, delay, color, size, weight, textColor }) => {
  const frame = useCurrentFrame() - delay;
  const grow = interpolate(frame, [0, 12], [0, 1], ease);
  const shrink = interpolate(frame, [14, 26], [0, 1], ease);
  return (
    <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start" }}>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: weight, fontSize: size, color: textColor, lineHeight: 1.15, opacity: frame >= 12 ? 1 : 0 }}>{text}</div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shrink * 100}%`, width: `${(grow - shrink) * 100}%`, background: color }} />
    </div>
  );
};

// Premium editorial title reveal (Apple / documentary style).
export const MaskReveal: React.FC<z.infer<typeof maskRevealSchema>> = ({ kicker, lines }) => {
  const base = useBase();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", padding: base * 0.1, gap: base * 0.015 }}>
        <RevealLine text={kicker} delay={0} color={theme.colors.secondary} size={base * 0.04} weight={600} textColor={theme.colors.secondary} />
        {lines.map((l, i) => (
          <RevealLine key={i} text={l} delay={10 + i * 10} color={i % 2 ? theme.colors.accent : theme.colors.primary} size={base * 0.1} weight={900} textColor={theme.colors.text} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
