import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const countdownSchema = z.object({
  label: z.string(),
  seconds: z.number().int().min(3).max(60),
  endText: z.string(),
});

// Premiere / live-stream countdown: a ring drains each second, the number punches in,
// the last 3 seconds pulse red, then the end text bursts out.
export const Countdown: React.FC<z.infer<typeof countdownSchema>> = ({ label, seconds, endText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const elapsed = frame / fps;
  const remaining = Math.max(0, seconds - Math.floor(elapsed));
  const done = elapsed >= seconds;
  const local = frame - Math.floor(elapsed) * fps;
  const punch = spring({ frame: local, fps, config: { damping: 11 } });
  const urgent = remaining <= 3 && !done;
  const color = urgent ? theme.colors.primary : theme.colors.secondary;
  const size = base * 0.6;
  const r = size * 0.42;
  const C = 2 * Math.PI * r;
  const secFrac = done ? 0 : 1 - local / fps;
  const burst = spring({ frame: frame - seconds * fps, fps, config: { damping: 8 } });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: base * 0.04 }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.05, color: theme.colors.muted, letterSpacing: base * 0.006, textTransform: "uppercase", opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>{label}</div>
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const inner = r + size * 0.05;
              const outer = inner + (i % 5 === 0 ? size * 0.035 : size * 0.018);
              return <line key={i} x1={size / 2 + Math.cos(a) * inner} y1={size / 2 + Math.sin(a) * inner} x2={size / 2 + Math.cos(a) * outer} y2={size / 2 + Math.sin(a) * outer} stroke="rgba(255,255,255,0.25)" strokeWidth={size * 0.006} />;
            })}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.05} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.05} strokeLinecap="round" strokeDasharray={`${secFrac * C} ${C}`} />
          </svg>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            {done ? (
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: size * 0.2, color: theme.colors.accent, transform: `scale(${burst})`, textShadow: `0 0 ${base * 0.04}px ${theme.colors.accent}` }}>{endText}</div>
            ) : (
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: size * 0.42, color: urgent ? theme.colors.primary : theme.colors.text, fontVariantNumeric: "tabular-nums", transform: `scale(${1.5 - 0.5 * punch})`, opacity: Math.min(1, punch * 1.5) }}>{remaining}</div>
            )}
          </AbsoluteFill>
          {urgent && <div style={{ position: "absolute", inset: -size * 0.05, borderRadius: "50%", border: `${size * 0.01}px solid ${theme.colors.primary}`, opacity: 1 - punch, transform: `scale(${1 + punch * 0.25})` }} />}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
