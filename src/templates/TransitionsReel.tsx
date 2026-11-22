import { TransitionSeries, linearTiming, springTiming, type TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { useBase } from "../lib/useBase";

export const transitionsReelSchema = z.object({
  scenes: z.array(z.string()).min(2),
  framesPerScene: z.number().int().positive(),
});

export const TRANSITION_FRAMES = 20;

const Scene: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const base = useBase();
  return (
    <AbsoluteFill style={{ background: color, justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.08 }}>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: theme.colors.background }}>{text}</div>
    </AbsoluteFill>
  );
};

// Showcase/scene-switcher using @remotion/transitions: fade, slide, wipe, flip, clock wipe.
export const TransitionsReel: React.FC<z.infer<typeof transitionsReelSchema>> = ({ scenes, framesPerScene }) => {
  const { width, height } = useVideoConfig();
  const colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, "#9B6BFF", "#4DFFB0", theme.colors.text];
  const presentations: TransitionPresentation<any>[] = [fade(), slide({ direction: "from-right" }), wipe({ direction: "from-left" }), flip(), clockWipe({ width, height })];

  return (
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={framesPerScene}>
            <Scene text={s} color={colors[i % colors.length]} />
          </TransitionSeries.Sequence>,
        ];
        if (i < scenes.length - 1) {
          items.push(
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={presentations[i % presentations.length]}
              timing={i % 2 ? springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_FRAMES }) : linearTiming({ durationInFrames: TRANSITION_FRAMES })}
            />,
          );
        }
        return items;
      })}
    </TransitionSeries>
  );
};
