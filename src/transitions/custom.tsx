// Extra scene transitions for <TransitionSeries>. Use them like the built-in ones:
//   <TransitionSeries.Transition presentation={iris({ shape: "star" })} timing={linearTiming({ durationInFrames: 20 })} />
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { useId } from "react";
import { AbsoluteFill, random, useVideoConfig } from "remotion";

type P<T extends Record<string, unknown>> = React.FC<TransitionPresentationComponentProps<T>>;

// ── Iris / shape mask: the next scene grows out of a circle, star or diamond ──
type IrisProps = { shape: "circle" | "star" | "diamond" };
const starPolygon = (scale: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = (i % 2 ? 0.45 : 1) * scale;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`);
  }
  return `polygon(${pts.join(", ")})`;
};
const IrisComp: P<IrisProps> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const clip =
    passedProps.shape === "circle" ? `circle(${p * 75}% at 50% 50%)` :
    passedProps.shape === "diamond" ? `polygon(50% ${50 - p * 100}%, ${50 + p * 100}% 50%, 50% ${50 + p * 100}%, ${50 - p * 100}% 50%)` :
    starPolygon(p * 140);
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};
export const iris = (props: IrisProps): TransitionPresentation<IrisProps> => ({ component: IrisComp, props });

// ── Whip pan: both scenes slide fast with motion blur peaking mid-way ──
type WhipProps = { direction: "left" | "right" };
const WhipComp: P<WhipProps> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { width } = useVideoConfig();
  const sign = passedProps.direction === "left" ? -1 : 1;
  const blur = Math.sin(p * Math.PI) * width * 0.02;
  const x = presentationDirection === "exiting" ? sign * p * 100 : -sign * (1 - p) * 100;
  return <AbsoluteFill style={{ transform: `translateX(${x}%) scaleX(${1 + Math.sin(p * Math.PI) * 0.08})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
};
export const whipPan = (props: WhipProps): TransitionPresentation<WhipProps> => ({ component: WhipComp, props });

// ── Ink / paint splash: the next scene is revealed through growing paint blobs ──
type InkProps = { seed: string };
const InkComp: P<InkProps> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const id = `ink-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const blobs = Array.from({ length: 9 }, (_, i) => {
    const delay = random(`${passedProps.seed}-d${i}`) * 0.4;
    const local = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
    return { cx: random(`${passedProps.seed}-x${i}`), cy: random(`${passedProps.seed}-y${i}`), r: local * (0.35 + random(`${passedProps.seed}-r${i}`) * 0.45) };
  });
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            {blobs.map((b, i) => (
              <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.r} ry={b.r * 1.6} />
            ))}
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
export const inkSplash = (props: InkProps): TransitionPresentation<InkProps> => ({ component: InkComp, props });

// ── Light leak / film burn: warm flare washes over a crossfade ──
type LeakProps = { color: string };
const LeakComp: P<LeakProps> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const flare = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: flare,
          background: `radial-gradient(ellipse 60% 80% at ${20 + p * 60}% 40%, ${passedProps.color} 0%, transparent 60%), radial-gradient(ellipse 40% 60% at ${80 - p * 50}% 70%, #FFD08A 0%, transparent 55%)`,
          filter: "blur(20px)",
        }}
      />
      <AbsoluteFill style={{ background: "#FFF4E0", opacity: Math.max(0, flare - 0.75) * 2.5, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
export const lightLeak = (props: LeakProps): TransitionPresentation<LeakProps> => ({ component: LeakComp, props });
