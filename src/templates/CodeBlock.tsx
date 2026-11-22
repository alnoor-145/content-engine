import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { Background } from "../components/Background";
import { useBase } from "../lib/useBase";

export const codeBlockSchema = z.object({
  filename: z.string(),
  code: z.string(),
  charsPerFrame: z.number().positive(),
});

const KEYWORDS = new Set(
  "const let var function return if else for while import from export default class new await async def print in of true false null None True False and or not try catch except with as type interface".split(" "),
);

const COLORS = { keyword: "#C792EA", string: "#C3E88D", comment: "#637777", number: "#F78C6C", fn: "#82AAFF", plain: "#D6DEEB" };

// Tiny tokenizer: enough to color JS/TS/Python nicely for tutorial videos.
const tokenize = (line: string) => {
  const re = /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\s+|.)/g;
  const out: { t: string; c: string }[] = [];
  for (const m of line.matchAll(re)) {
    if (m[1]) out.push({ t: m[1], c: COLORS.comment });
    else if (m[2]) out.push({ t: m[2], c: COLORS.string });
    else if (m[3]) out.push({ t: m[3], c: COLORS.number });
    else if (m[4]) out.push({ t: m[4], c: KEYWORDS.has(m[4]) ? COLORS.keyword : COLORS.fn });
    else if (m[5]) out.push({ t: m[5], c: KEYWORDS.has(m[5]) ? COLORS.keyword : COLORS.plain });
    else out.push({ t: m[0], c: COLORS.plain });
  }
  return out;
};

// Code editor window that types out code with syntax colors. For programming/tech tutorials.
export const CodeBlock: React.FC<z.infer<typeof codeBlockSchema>> = ({ filename, code, charsPerFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const shown = code.slice(0, Math.max(0, Math.floor((frame - 10) * charsPerFrame)));
  const lines = shown.split("\n");
  const total = code.split("\n").length;
  const font = Math.min(base * 0.04, (base * 0.75) / Math.max(total, 1) / 1.5);
  const blink = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: base * 0.06 }}>
        <div style={{ width: "100%", maxWidth: base * 1.5, borderRadius: base * 0.02, background: "#011627", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", transform: `translateY(${(1 - enter) * base * 0.1}px)`, opacity: enter, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: base * 0.012, padding: `${base * 0.018}px ${base * 0.025}px`, background: "#0B2942" }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
              <div key={c} style={{ width: base * 0.02, height: base * 0.02, borderRadius: "50%", background: c }} />
            ))}
            <div style={{ marginLeft: base * 0.02, fontFamily: theme.fonts.mono, fontSize: base * 0.026, color: "#8DA2B5" }}>{filename}</div>
          </div>
          <div style={{ padding: `${base * 0.03}px ${base * 0.03}px`, fontFamily: theme.fonts.mono, fontSize: font, lineHeight: 1.5, whiteSpace: "pre", minHeight: font * 1.5 * total }}>
            {lines.map((l, i) => (
              <div key={i} style={{ display: "flex" }}>
                <span style={{ width: font * 2.2, color: "#4B6479", flexShrink: 0 }}>{i + 1}</span>
                <span>
                  {tokenize(l).map((tk, j) => (
                    <span key={j} style={{ color: tk.c }}>{tk.t}</span>
                  ))}
                  {i === lines.length - 1 && <span style={{ color: theme.colors.accent, opacity: blink ? 1 : 0 }}>▍</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
