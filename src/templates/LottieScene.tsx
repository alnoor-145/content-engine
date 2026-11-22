import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import demo from "../assets/demo-lottie.json";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const lottieSceneSchema = z.object({
  // A Lottie .json in public/ (e.g. "character.json") or a URL. Empty = bundled bouncing-ball demo.
  src: z.string(),
  title: z.string(),
  subtitle: z.string(),
  playbackRate: z.number().positive(),
});

const useLottieData = (src: string) => {
  const [data, setData] = useState<LottieAnimationData | null>(src ? null : (demo as unknown as LottieAnimationData));
  const [handle] = useState(() => (src ? delayRender(`Loading Lottie ${src}`) : null));
  useEffect(() => {
    if (!src || handle === null) return;
    fetch(/^https?:\/\//.test(src) ? src : staticFile(src))
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [src, handle]);
  return data;
};

// Plays any After Effects / LottieFiles animation (characters, icons, explainer scenes) inside your branded frame.
// Export from After Effects with Bodymovin, or download free .json animations from LottieFiles.
export const LottieScene: React.FC<z.infer<typeof lottieSceneSchema>> = ({ src, title, subtitle, playbackRate }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const data = useLottieData(src);
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const portrait = height > width;
  const box = portrait ? width * 0.8 : height * 0.62;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: base * 0.03 }}>
        <div style={{ width: box, height: box, transform: `scale(${enter})` }}>
          {data && <Lottie animationData={data} loop playbackRate={playbackRate} style={{ width: "100%", height: "100%" }} />}
        </div>
        <div style={{ textAlign: "center", opacity: interpolate(frame, [10, 25], [0, 1], clamp) }}>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.07, color: theme.colors.text }}>{title}</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted }}>{subtitle}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
