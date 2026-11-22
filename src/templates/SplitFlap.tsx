import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { graphemes, isBangla } from "../lib/text";
import { clamp, useBase } from "../lib/useBase";

export const splitFlapSchema = z.object({
  label: z.string(),
  lines: z.array(z.string()).min(1),
});

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BANGLA = Array.from("অআইউএকখগচজটডতদনপবমরলসহ০১২৩৪৫৬৭৮৯");

// Airport/train departure board: every tile flips through characters before landing.
export const SplitFlap: React.FC<z.infer<typeof splitFlapSchema>> = ({ label, lines }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const base = useBase();
  const rows = lines.map((l) => graphemes(l.toUpperCase()));
  const cols = Math.max(...rows.map((r) => r.length));
  const cell = Math.min((width * 0.9) / cols, base * 0.13);

  return (
    <AbsoluteFill style={{ background: "#07080C", justifyContent: "center", alignItems: "center", gap: cell * 0.25 }}>
      <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.035, color: theme.colors.accent, letterSpacing: base * 0.006, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>{label}</div>
      {rows.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: cell * 0.08 }}>
          {Array.from({ length: cols }).map((_, c) => {
            const target = row[c] ?? " ";
            const settle = 8 + r * 6 + c * 2.2 + 14;
            const pool = isBangla(target) ? BANGLA : Array.from(LATIN);
            const flipping = frame < settle && target !== " ";
            const ch = flipping ? pool[Math.floor(random(`${r}-${c}-${Math.floor(frame / 2)}`) * pool.length)] : target;
            const phase = flipping ? (frame % 2) / 2 : 0;
            return (
              <div key={c} style={{ position: "relative", width: cell, height: cell * 1.35, borderRadius: cell * 0.08, background: "linear-gradient(#1D2130 0 49.5%, #000 49.5% 50.5%, #161A26 50.5%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: cell * 0.78, color: flipping ? "#C9CEE0" : "#FFFFFF", overflow: "hidden", boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.6)" }}>
                <span style={{ transform: `scaleY(${1 - phase * 0.6})` }}>{ch === " " ? "" : ch}</span>
              </div>
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};
