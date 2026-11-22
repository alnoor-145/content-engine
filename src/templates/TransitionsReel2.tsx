import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { useBase } from "../lib/useBase";
import { inkSplash, iris, lightLeak, whipPan } from "../transitions/custom";

export const transitionsReel2Schema = z.object({
  scenes: z.array(z.string()).min(2),
  framesPerScene: z.number().int().positive(),
});

export const TRANSITION2_FRAMES = 24;

const BGS = [
  `linear-gradient(135deg, ${theme.colors.primary}, #9B6BFF)`,
  `linear-gradient(135deg, ${theme.colors.secondary}, #4DFFB0)`,
  `linear-gradient(135deg, ${theme.colors.accent}, #FF9F4D)`,
  `linear-gradient(135deg, #1D3557, ${theme.colors.secondary})`,
  `linear-gradient(135deg, #FF6BD6, ${theme.colors.primary})`,
  `linear-gradient(135deg, #2B1055, #7597DE)`,
  `linear-gradient(135deg, #111, #444)`,
];

const Scene: React.FC<{ text: string; i: number }> = ({ text, i }) => {
  const base = useBase();
  return (
    <AbsoluteFill style={{ background: BGS[i % BGS.length], justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.08 }}>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>{text}</div>
    </AbsoluteFill>
  );
};

// Showcase of the custom transitions in src/transitions/custom.tsx:
// circle iris, star mask, whip pan (motion blur), ink splash, light leak, diamond wipe.
export const TransitionsReel2: React.FC<z.infer<typeof transitionsReel2Schema>> = ({ scenes, framesPerScene }) => {
  const presentations: TransitionPresentation<any>[] = [
    iris({ shape: "circle" }),
    iris({ shape: "star" }),
    whipPan({ direction: "left" }),
    inkSplash({ seed: "ink" }),
    lightLeak({ color: "#FF7A59" }),
    iris({ shape: "diamond" }),
  ];
  return (
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={framesPerScene}>
            <Scene text={s} i={i} />
          </TransitionSeries.Sequence>,
        ];
        if (i < scenes.length - 1) {
          items.push(<TransitionSeries.Transition key={`t${i}`} presentation={presentations[i % presentations.length]} timing={linearTiming({ durationInFrames: TRANSITION2_FRAMES })} />);
        }
        return items;
      })}
    </TransitionSeries>
  );
};
