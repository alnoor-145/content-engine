import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { LowerThird } from "../components/LowerThird";

export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  handle: z.string(),
});

export type TitleCardProps = z.infer<typeof titleCardSchema>;

// Intro / thumbnail-style title card: title springs in, accent bar wipes, subtitle fades up.
export const TitleCard: React.FC<TitleCardProps> = ({ title, subtitle, handle }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const bar = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const sub = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.08, textAlign: "center" }}>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: base * 0.11,
            lineHeight: 1.05,
            color: theme.colors.text,
            transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])})`,
            opacity: pop,
          }}
        >
          {title}
        </div>
        <div
          style={{
            height: base * 0.012,
            width: base * 0.5 * bar,
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            borderRadius: 999,
            margin: `${base * 0.035}px 0`,
          }}
        />
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: base * 0.045,
            color: theme.colors.muted,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [30, 0])}px)`,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
      <LowerThird text={handle} delay={35} />
    </AbsoluteFill>
  );
};
