import { loadFont } from "@remotion/google-fonts/PressStart2P";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

const { fontFamily: PIXEL } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

export const pixelArtSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  coins: z.number().int().min(1).max(12),
});

// Original sprites (our own "Bit" robot and crystal gems): each string is a row, each char a palette key ("." = transparent).
const SPRITE_PAL: Record<string, string> = {
  k: "#1B1B2F", w: "#FFFFFF", y: "#FFD23F", o: "#F77622", t: "#3ECFB2", T: "#24917D", p: "#B55088",
  c: "#2CE8F5", C: "#1E88B4", G: "#3ECFB2", d: "#2A2348", D: "#3B2F63",
};
const HERO = [
  ["....yy....", "....kk....", "..tttttt..", ".tttttttt.", ".twwttwwt.", ".twkttwkt.", ".tttttttt.", "..tkkkkt..", ".pTttttTp.", ".pTttttTp.", "..TT..TT..", ".kkk..kkk."],
  ["....yy....", "....kk....", "..tttttt..", ".tttttttt.", ".twwttwwt.", ".twkttwkt.", ".tttttttt.", "..tkkkkt..", "pTttttttTp", "..TttttT..", ".TT....TT.", "kkk....kkk"],
];
const GEM = ["...cc...", "..cwcc..", ".cwcccc.", "cwcccccC", ".ccccCC.", "..ccCC..", "...CC...", "........"];

const Sprite: React.FC<{ rows: string[]; px: number; x: number; y: number }> = ({ rows, px, x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    {rows.flatMap((row, ry) =>
      Array.from(row).map((c, rx) => (c === "." ? null : <rect key={`${rx}-${ry}`} x={rx * px} y={ry * px} width={px + 0.5} height={px + 0.5} fill={SPRITE_PAL[c]} />)),
    )}
  </g>
);

// 8-bit retro scene: an original pixel robot runs along a tiled ground collecting gems, score counts up,
// title in a pixel font with a blinking "PRESS START". Animated on 2s for a retro feel.
export const PixelArt: React.FC<z.infer<typeof pixelArtSchema>> = ({ title, subtitle, coins }) => {
  const raw = useCurrentFrame();
  const frame = raw - (raw % 2); // step animation (12 updates/sec at 24fps feel)
  const { width, height } = useVideoConfig();
  const base = useBase();
  const px = Math.round(base * 0.012);
  const groundY = height * 0.72;
  const heroX = interpolate(frame, [0, 140], [-px * 12, width + px * 4], clamp);
  const heroY = groundY - px * 12 - Math.abs(Math.sin(frame * 0.25)) * px * 3;
  const spacing = width / (coins + 1);
  const collected = Array.from({ length: coins }, (_, i) => heroX + px * 6 > spacing * (i + 1));
  const score = collected.filter(Boolean).length * 100;
  const tile = px * 6;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#2B1055 0%, #6A3FA0 55%, #F28AB2 100%)" }}>
      <svg width={width} height={height} shapeRendering="crispEdges" style={{ position: "absolute" }}>
        {[0.15, 0.55, 0.85].map((cx, i) => {
          const x = ((cx * width - frame * (0.6 + i * 0.3)) % (width + 200) + width + 200) % (width + 200) - 100;
          return (
            <g key={i}>
              <rect x={x} y={height * (0.18 + i * 0.07)} width={px * 14} height={px * 4} fill="#E0D5FF" opacity={0.85} />
              <rect x={x + px * 3} y={height * (0.18 + i * 0.07) - px * 3} width={px * 7} height={px * 3} fill="#E0D5FF" opacity={0.85} />
            </g>
          );
        })}
        {Array.from({ length: Math.ceil(width / tile) + 1 }).map((_, i) => (
          <g key={i}>
            <rect x={i * tile} y={groundY} width={tile} height={px * 2} fill={SPRITE_PAL.G} />
            <rect x={i * tile} y={groundY + px * 2} width={tile} height={height - groundY} fill={i % 2 ? SPRITE_PAL.d : SPRITE_PAL.D} />
          </g>
        ))}
        {Array.from({ length: coins }).map((_, i) =>
          collected[i] ? null : <Sprite key={i} rows={GEM} px={px} x={spacing * (i + 1) - px * 4} y={groundY - px * 20 + Math.sin(frame * 0.2 + i) * px * 2} />,
        )}
        <Sprite rows={HERO[Math.floor(frame / 6) % 2]} px={px} x={heroX} y={heroY} />
      </svg>
      <div style={{ position: "absolute", top: base * 0.04, right: base * 0.05, fontFamily: PIXEL, fontSize: base * 0.035, color: "#fff", textShadow: `${px / 2}px ${px / 2}px 0 #000` }}>
        SCORE {String(score).padStart(5, "0")}
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingBottom: height * 0.25, gap: base * 0.04 }}>
        <div style={{ fontFamily: `${PIXEL}, ${theme.fonts.bangla}`, fontSize: base * 0.075, color: SPRITE_PAL.y, textShadow: `${px}px ${px}px 0 #000, ${-px / 2}px ${-px / 2}px 0 ${SPRITE_PAL.o}`, lineHeight: 1.4, opacity: raw > 4 ? 1 : 0 }}>
          {title}
        </div>
        <div style={{ fontFamily: PIXEL, fontSize: base * 0.03, color: "#fff", opacity: Math.floor(raw / 15) % 2 === 0 ? 1 : 0, textShadow: `${px / 2}px ${px / 2}px 0 #000` }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
