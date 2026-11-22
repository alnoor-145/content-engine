import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const notificationPopSchema = z.object({
  notifications: z.array(z.object({ app: z.string(), icon: z.string(), title: z.string(), body: z.string() })),
  framesPerNotification: z.number().int().positive(),
});

// Phone-style notification banners dropping in and stacking. Strong hook for Shorts/Reels.
export const NotificationPop: React.FC<z.infer<typeof notificationPopSchema>> = ({ notifications, framesPerNotification }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const w = Math.min(width * 0.9, base * 1.1);
  const h = base * 0.17;
  const gap = base * 0.025;
  const top = height * 0.12;
  const at = (i: number) => 8 + i * framesPerNotification;
  const enterOf = (i: number) => spring({ frame: frame - at(i), fps, config: { damping: 15, mass: 0.7 } });

  return (
    <AbsoluteFill>
      <Background />
      {notifications.map((n, i) => {
        if (frame < at(i)) return null;
        const enter = enterOf(i);
        // Each newer notification pushes this one down by one slot.
        const pushed = notifications.slice(i + 1).reduce((acc, _, k) => acc + (frame >= at(i + 1 + k) ? enterOf(i + 1 + k) : 0), 0);
        const y = top + pushed * (h + gap) - (1 - enter) * (h + top);
        return (
          <div key={i} style={{ position: "absolute", left: (width - w) / 2, top: y, width: w, height: h, borderRadius: base * 0.035, background: "rgba(30,34,52,0.92)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: base * 0.025, padding: `0 ${base * 0.03}px`, opacity: Math.min(1, enter * 1.5) * (pushed > 3 ? 0 : 1), boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
            <div style={{ width: h * 0.55, height: h * 0.55, borderRadius: base * 0.022, background: theme.colors.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: h * 0.32, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: theme.fonts.body, fontSize: base * 0.024, color: theme.colors.muted }}>
                <span>{n.app.toUpperCase()}</span>
                <span>now</span>
              </div>
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: base * 0.034, color: theme.colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
              <div style={{ fontFamily: theme.fonts.body, fontSize: base * 0.028, color: "#C9CEE0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.body}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
