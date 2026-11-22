import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const audioWaveSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  // File inside public/ (e.g. "voice.mp3") or a full URL. Empty = demo animation without sound.
  audioSrc: z.string(),
  durationSeconds: z.number().positive(),
});

const BARS = 48;

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

const Bars: React.FC<{ values: number[] }> = ({ values }) => {
  const base = useBase();
  const { width } = useVideoConfig();
  const barW = Math.min((width * 0.8) / BARS, base * 0.025);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: barW * 0.45, height: base * 0.3 }}>
      {values.map((v, i) => (
        <div key={i} style={{ width: barW, height: Math.max(barW, v * base * 0.3), borderRadius: 99, background: `linear-gradient(${theme.colors.secondary}, ${theme.colors.primary})` }} />
      ))}
    </div>
  );
};

// Mirror the spectrum so low frequencies sit in the middle, like most audiograms.
const mirror = (v: number[]) => [...v.slice(0, BARS / 2).reverse(), ...v.slice(0, BARS / 2)];

const AudioBars: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);
  if (!audioData) return <Bars values={new Array(BARS).fill(0.02)} />;
  const spectrum = visualizeAudio({ fps, frame, audioData, numberOfSamples: 64, optimizeFor: "speed" });
  return <Bars values={mirror(spectrum.map((x) => Math.min(1, Math.sqrt(x) * 1.6)))} />;
};

const DemoBars: React.FC = () => {
  const frame = useCurrentFrame();
  const vals = new Array(BARS / 2).fill(0).map((_, i) => {
    const beat = Math.pow(Math.max(0, Math.sin(frame * 0.21)), 8);
    return Math.min(1, 0.12 + 0.35 * Math.abs(Math.sin(frame * 0.13 + i * 0.6)) * (1 - i / BARS) + beat * 0.5 * (1 - i / (BARS / 2)));
  });
  return <Bars values={mirror(vals)} />;
};

// Podcast audiogram / music visualizer. Point audioSrc at your voiceover to make the bars react to it.
export const AudioWave: React.FC<z.infer<typeof audioWaveSchema>> = ({ title, subtitle, audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const src = audioSrc ? resolveSrc(audioSrc) : null;

  return (
    <AbsoluteFill>
      <Background />
      {src && <Audio src={src} />}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: base * 0.05, textAlign: "center", padding: base * 0.06 }}>
        <div style={{ width: base * 0.26, height: base * 0.26, borderRadius: base * 0.05, background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: base * 0.13, transform: `scale(${enter})`, boxShadow: `0 0 ${base * 0.08}px ${theme.colors.primary}66` }}>
          🎙️
        </div>
        <div style={{ opacity: interpolate(frame, [8, 22], [0, 1], clamp) }}>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.065, color: theme.colors.text }}>{title}</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.035, color: theme.colors.muted }}>{subtitle}</div>
        </div>
        {src ? <AudioBars src={src} /> : <DemoBars />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
