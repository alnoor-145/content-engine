import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const textOnPathSchema = z.object({
  text: z.string(),
  centerText: z.string(),
  shape: z.enum(["circle", "wave"]),
  speed: z.number(),
});

// Text that flows along a path: a spinning circular badge (with a center label) or a scrolling wave.
export const TextOnPath: React.FC<z.infer<typeof textOnPathSchema>> = ({ text, centerText, shape, speed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = useBase();
  const appear = interpolate(frame, [0, 20], [0, 1], clamp);

  if (shape === "circle") {
    const r = base * 0.3;
    const size = r * 2 + base * 0.2;
    const c = size / 2;
    const d = `M ${c - r} ${c} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`;
    // Repeat the text so it wraps the whole circle.
    const ring = `${text} • `.repeat(Math.max(1, Math.round((2 * Math.PI * r) / (text.length * base * 0.036 + base * 0.05))));
    return (
      <AbsoluteFill>
        <Background />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <svg width={size} height={size} style={{ position: "absolute", transform: `rotate(${frame * speed}deg) scale(${appear})` }}>
            <defs>
              <path id="top-circle" d={d} />
            </defs>
            <circle cx={c} cy={c} r={r + base * 0.055} fill="none" stroke={theme.colors.primary} strokeWidth={base * 0.004} opacity={0.6} />
            <circle cx={c} cy={c} r={r - base * 0.055} fill="none" stroke={theme.colors.secondary} strokeWidth={base * 0.004} opacity={0.6} />
            <text fill={theme.colors.text} fontFamily={theme.fonts.heading} fontWeight={800} fontSize={base * 0.05} letterSpacing={base * 0.006} dominantBaseline="middle">
              <textPath href="#top-circle">{ring}</textPath>
            </text>
          </svg>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.09, color: theme.colors.accent, opacity: interpolate(frame, [15, 30], [0, 1], clamp), textAlign: "center", maxWidth: r * 1.5 }}>
            {centerText}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  const amp = height * 0.12;
  const pts: string[] = [];
  for (let x = -width * 0.1; x <= width * 1.1; x += width / 60) {
    pts.push(`${pts.length ? "L" : "M"} ${x} ${height / 2 + Math.sin(x / (width / 4) + frame * 0.05) * amp}`);
  }
  const offset = 100 - ((frame * speed * 0.4) % 200);
  return (
    <AbsoluteFill>
      <Background />
      <svg width={width} height={height} style={{ position: "absolute", opacity: appear }}>
        <defs>
          <path id="wave" d={pts.join(" ")} />
        </defs>
        <use href="#wave" fill="none" stroke={theme.colors.secondary} strokeWidth={base * 0.003} opacity={0.35} />
        <text fill={theme.colors.text} fontFamily={theme.fonts.heading} fontWeight={900} fontSize={base * 0.085} dominantBaseline="middle">
          <textPath href="#wave" startOffset={`${offset}%`}>{text}</textPath>
        </text>
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: base * 0.1 }}>
        <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.04, color: theme.colors.muted }}>{centerText}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
