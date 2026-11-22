import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const photoFXSchema = z.object({
  // Image in public/ (e.g. "my-photo.jpg") or a full URL.
  src: z.string(),
  mode: z.enum(["kenburns", "punchin", "duotone", "halftone", "parallax"]),
  title: z.string(),
  subtitle: z.string(),
});

const resolve = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));
const cover: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

// Photo treatments for documentary / editorial videos: Ken Burns, beat punch-ins,
// duotone, halftone print and 2.5D parallax — all from a single still image.
export const PhotoFX: React.FC<z.infer<typeof photoFXSchema>> = ({ src, mode, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const base = useBase();
  const url = resolve(src);
  const prog = frame / durationInFrames;

  let layer: React.ReactNode;
  if (mode === "kenburns") {
    const s = interpolate(prog, [0, 1], [1.05, 1.25], { easing: Easing.inOut(Easing.sin) });
    layer = <Img src={url} style={{ ...cover, transform: `scale(${s}) translate(${interpolate(prog, [0, 1], [-2, 2])}%, ${interpolate(prog, [0, 1], [1, -1])}%)` }} />;
  } else if (mode === "punchin") {
    const hits = [25, 55, 85];
    const s = 1 + hits.reduce((acc, h) => acc + 0.14 * spring({ frame: frame - h, fps, config: { damping: 15, stiffness: 300 } }), 0);
    const near = hits.some((h) => frame >= h && frame < h + 4);
    const shake = near ? Math.sin(frame * 9) * base * 0.006 : 0;
    layer = <Img src={url} style={{ ...cover, transform: `scale(${s}) translate(${shake}px, ${-shake}px)`, filter: near ? `blur(${base * 0.003}px)` : undefined }} />;
  } else if (mode === "duotone") {
    layer = (
      <AbsoluteFill style={{ background: "#FFD1DC", isolation: "isolate" }}>
        <Img src={url} style={{ ...cover, filter: "grayscale(1) contrast(1.2)", mixBlendMode: "multiply", transform: `scale(${1.05 + prog * 0.08})` }} />
        <AbsoluteFill style={{ background: "#1D1B4B", mixBlendMode: "lighten" }} />
      </AbsoluteFill>
    );
  } else if (mode === "halftone") {
    const dot = base * (0.016 + 0.004 * Math.sin(frame * 0.05));
    layer = (
      <AbsoluteFill style={{ isolation: "isolate" }}>
        {/* Threshold layer: gray dot grid × photo, then extreme contrast turns it into pure dots. */}
        <AbsoluteFill style={{ background: "#fff", filter: "contrast(16)", overflow: "hidden" }}>
          <AbsoluteFill style={{ backgroundImage: "radial-gradient(closest-side, #777, #fff)", backgroundSize: `${dot}px ${dot}px` }} />
          <Img src={url} style={{ ...cover, filter: "grayscale(1) brightness(1.25)", mixBlendMode: "multiply", transform: `scale(${1.05 + prog * 0.06})` }} />
        </AbsoluteFill>
        {/* Risograph colours: black → navy ink, white → cream paper. */}
        <AbsoluteFill style={{ background: "#1D3557", mixBlendMode: "lighten" }} />
        <AbsoluteFill style={{ background: "#F4EBD9", mixBlendMode: "multiply" }} />
      </AbsoluteFill>
    );
  } else {
    // parallax: blurred background drifts one way, a soft-masked center "subject" drifts the other way and grows.
    const bgX = interpolate(prog, [0, 1], [2, -2]);
    const fgX = interpolate(prog, [0, 1], [-3, 3]);
    const mask = "radial-gradient(ellipse 34% 42% at 50% 50%, #000 60%, transparent 100%)";
    layer = (
      <AbsoluteFill>
        <Img src={url} style={{ ...cover, transform: `scale(1.15) translateX(${bgX}%)`, filter: `blur(${base * 0.006}px) brightness(0.75)` }} />
        <Img src={url} style={{ ...cover, transform: `scale(${1.1 + prog * 0.12}) translateX(${fgX}%)`, WebkitMaskImage: mask, maskImage: mask }} />
      </AbsoluteFill>
    );
  }

  const textIn = interpolate(frame, [10, 25], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {layer}
      <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.75))" }} />
      <div style={{ position: "absolute", left: base * 0.06, bottom: base * 0.07, opacity: textIn, transform: `translateY(${(1 - textIn) * base * 0.03}px)` }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.08, color: "#fff" }}>{title}</div>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: "rgba(255,255,255,0.8)" }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};
