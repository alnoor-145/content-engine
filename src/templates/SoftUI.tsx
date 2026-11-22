import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const softUISchema = z.object({
  title: z.string(),
  value: z.number().min(0).max(100),
  label: z.string(),
  toggleLabel: z.string(),
});

const BG = "#E0E5EC";
const LIGHT = "#FFFFFF";
const DARK = "#A3B1C6";

const raised = (d: number): React.CSSProperties => ({ background: BG, boxShadow: `${d}px ${d}px ${d * 2}px ${DARK}, ${-d}px ${-d}px ${d * 2}px ${LIGHT}` });
const inset = (d: number): React.CSSProperties => ({ background: BG, boxShadow: `inset ${d}px ${d}px ${d * 2}px ${DARK}, inset ${-d}px ${-d}px ${d * 2}px ${LIGHT}` });

// Neumorphism / soft UI: extruded dial filling to a value, a toggle that switches on and a pressable button.
// Use for app demos, product features and "settings" style explainers.
export const SoftUI: React.FC<z.infer<typeof softUISchema>> = ({ title, value, label, toggleLabel }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const d = base * 0.012;
  const fill = interpolate(frame, [15, 75], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dial = base * 0.42;
  const r = dial * 0.38;
  const C = 2 * Math.PI * r;
  const toggled = spring({ frame: frame - 70, fps, config: { damping: 14 } });
  const pressed = frame >= 95 && frame < 105;
  const enter = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center", flexDirection: portrait ? "column" : "row", gap: base * 0.08, opacity: enter }}>
      <div style={{ ...raised(d), width: dial, height: dial, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ ...inset(d * 0.7), width: dial * 0.86, height: dial * 0.86, borderRadius: "50%" }} />
        <svg width={dial} height={dial} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx={dial / 2} cy={dial / 2} r={r} fill="none" stroke={theme.colors.primary} strokeWidth={dial * 0.05} strokeLinecap="round" strokeDasharray={`${(fill / 100) * C} ${C}`} />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: dial * 0.2, color: "#4A5568" }}>{Math.round(fill)}%</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: dial * 0.07, color: "#8A94A6" }}>{label}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: base * 0.05, alignItems: portrait ? "center" : "flex-start" }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.07, color: "#4A5568", textShadow: `2px 2px 3px ${LIGHT}` }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: base * 0.03 }}>
          <div style={{ ...inset(d * 0.6), width: base * 0.2, height: base * 0.1, borderRadius: 999, position: "relative" }}>
            <div style={{ position: "absolute", top: base * 0.012, left: base * 0.012 + toggled * base * 0.1, width: base * 0.076, height: base * 0.076, borderRadius: "50%", background: interpolate(toggled, [0, 1], [0, 1]) > 0.5 ? theme.colors.primary : BG, boxShadow: `${d * 0.5}px ${d * 0.5}px ${d}px ${DARK}, ${-d * 0.5}px ${-d * 0.5}px ${d}px ${LIGHT}` }} />
          </div>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: "#4A5568" }}>{toggleLabel}</div>
        </div>
        <div style={{ ...(pressed ? inset(d * 0.6) : raised(d * 0.6)), padding: `${base * 0.025}px ${base * 0.07}px`, borderRadius: base * 0.03, fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.04, color: pressed ? theme.colors.primary : "#4A5568" }}>
          Start
        </div>
      </div>
    </AbsoluteFill>
  );
};
