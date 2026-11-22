import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { clamp, useBase } from "../lib/useBase";

export const chapterBarSchema = z.object({
  chapters: z.array(z.object({ title: z.string(), seconds: z.number().positive() })).min(1),
});

// Chapter cards + segmented progress bar. Use as section dividers in long videos.
export const ChapterBar: React.FC<z.infer<typeof chapterBarSchema>> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const total = chapters.reduce((a, c) => a + c.seconds, 0);
  const t = frame / fps;
  let acc = 0;
  let current = 0;
  chapters.forEach((c, i) => {
    if (t >= acc) current = i;
    acc += c.seconds;
  });
  const startOfCurrent = chapters.slice(0, current).reduce((a, c) => a + c.seconds, 0) * fps;
  const local = frame - startOfCurrent;
  const p = spring({ frame: local, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: base * 0.08 }}>
        <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: base * 0.04, color: theme.colors.secondary, letterSpacing: base * 0.004, opacity: p }}>
          CHAPTER {current + 1}
        </div>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 900, fontSize: base * 0.1, color: theme.colors.text, transform: `translateY(${(1 - p) * base * 0.05}px)`, opacity: p }}>
          {chapters[current].title}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: base * 0.05, right: base * 0.05, bottom: base * 0.07, display: "flex", gap: base * 0.008 }}>
        {chapters.map((c, i) => {
          const s = chapters.slice(0, i).reduce((a, x) => a + x.seconds, 0);
          const fill = interpolate(t, [s, s + c.seconds], [0, 100], clamp);
          return (
            <div key={i} style={{ flex: c.seconds / total, display: "flex", flexDirection: "column", gap: base * 0.01 }}>
              <div style={{ height: base * 0.014, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${fill}%`, height: "100%", background: i === current ? theme.colors.primary : theme.colors.text }} />
              </div>
              <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.022, color: i === current ? theme.colors.text : theme.colors.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
