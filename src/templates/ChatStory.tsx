import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const chatStorySchema = z.object({
  contactName: z.string(),
  status: z.string(),
  messages: z.array(z.object({ from: z.enum(["me", "them"]), text: z.string() })),
  framesPerMessage: z.number().int().positive(),
});

const TYPING = 14;

// Messenger/WhatsApp-style chat story inside a phone. Great for skits, drama and story shorts.
export const ChatStory: React.FC<z.infer<typeof chatStorySchema>> = ({ contactName, status, messages, framesPerMessage }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = useBase();
  const portrait = height > width;
  const phoneW = portrait ? width * 0.88 : height * 0.5;
  const phoneH = portrait ? height * 0.86 : height * 0.92;
  const u = phoneW / 100; // phone unit

  const startOf = (i: number) => 10 + i * framesPerMessage;
  const typingFor = messages.findIndex((m, i) => m.from === "them" && frame >= startOf(i) && frame < startOf(i) + TYPING);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: phoneW, height: phoneH, borderRadius: u * 8, background: "#0E1220", border: `${u * 1.2}px solid #2A3048`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 ${base * 0.03}px ${base * 0.08}px rgba(0,0,0,0.5)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: u * 3, padding: `${u * 4}px ${u * 4}px ${u * 3}px`, background: theme.colors.surface }}>
            <div style={{ width: u * 11, height: u * 11, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: u * 5 }}>
              {contactName.trim().charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: u * 5, color: theme.colors.text }}>{contactName}</div>
              <div style={{ fontFamily: theme.fonts.body, fontSize: u * 3.4, color: typingFor >= 0 ? theme.colors.secondary : theme.colors.muted }}>{typingFor >= 0 ? "typing…" : status}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: u * 2.5, padding: u * 4, overflow: "hidden" }}>
            {messages.map((m, i) => {
              const appear = startOf(i) + (m.from === "them" ? TYPING : 0);
              if (frame < appear) return null;
              const p = spring({ frame: frame - appear, fps, config: { damping: 14, mass: 0.6 } });
              const mine = m.from === "me";
              return (
                <div key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%", background: mine ? theme.colors.primary : "#252B40", color: "#fff", fontFamily: theme.fonts.body, fontSize: u * 4.4, lineHeight: 1.35, padding: `${u * 2.4}px ${u * 3.6}px`, borderRadius: u * 5, borderBottomRightRadius: mine ? u * 1 : u * 5, borderBottomLeftRadius: mine ? u * 5 : u * 1, transform: `scale(${p})`, transformOrigin: mine ? "100% 100%" : "0% 100%" }}>
                  {m.text}
                </div>
              );
            })}
            {typingFor >= 0 && (
              <div style={{ alignSelf: "flex-start", background: "#252B40", padding: `${u * 3}px ${u * 4}px`, borderRadius: u * 5, display: "flex", gap: u * 1.5 }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: u * 2, height: u * 2, borderRadius: "50%", background: theme.colors.muted, transform: `translateY(${Math.sin((frame + d * 4) * 0.5) * u * 0.8}px)` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
