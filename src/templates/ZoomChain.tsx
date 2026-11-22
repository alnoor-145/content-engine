import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";

export const zoomChainSchema = z.object({
  // Your own pictures (in public/ or URLs): a map screenshot, a photo of the area, your house…
  // x/y = where to zoom, as 0–1 of the image width/height.
  images: z.array(z.object({ src: z.string(), x: z.number().min(0).max(1), y: z.number().min(0).max(1), label: z.string() })).min(1),
  framesPerImage: z.number().int().min(40),
  zoom: z.number().min(1.5).max(20),
});

const resolve = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));
const XFADE = 14;

// Zoom chain: each image highlights a spot, the camera dives into it, and the next (closer) image
// fades in — e.g. country map → city → street → your house. Works with any pictures you have rights to.
export const ZoomChain: React.FC<z.infer<typeof zoomChainSchema>> = ({ images, framesPerImage, zoom }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const idx = Math.min(images.length - 1, Math.floor(frame / framesPerImage));
  const level = Math.min(images.length - 1, Math.floor((frame + XFADE) / framesPerImage));

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {images.map((im, i) => {
        const start = i * framesPerImage;
        const local = frame - start;
        if (local < -XFADE || local > framesPerImage + 2) return null;
        const isLast = i === images.length - 1;
        // Hold, then dive towards (x, y). The last image only drifts slightly.
        const dive = interpolate(local, [framesPerImage * 0.45, framesPerImage], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        const s = isLast ? 1 + 0.08 * (local / framesPerImage) : Math.exp(Math.log(zoom) * dive) * (1 + 0.04 * (local / framesPerImage));
        const opacity = interpolate(local, [-XFADE, 0], [0, 1], clamp);
        const ring = spring({ frame: local - 8, fps, config: { damping: 12 } });
        const ringOut = interpolate(local, [framesPerImage * 0.4, framesPerImage * 0.55], [1, 0], clamp);
        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${im.x * 100}% ${im.y * 100}%` }}>
              <Img src={resolve(im.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
            {!isLast && (
              <div style={{ position: "absolute", left: `${im.x * 100}%`, top: `${im.y * 100}%`, width: 0, height: 0, opacity: ring * ringOut }}>
                <div style={{ position: "absolute", left: -base * 0.07, top: -base * 0.07, width: base * 0.14, height: base * 0.14, borderRadius: "50%", border: `${base * 0.006}px solid ${theme.colors.accent}`, transform: `scale(${ring})`, boxShadow: `0 0 ${base * 0.03}px ${theme.colors.accent}` }} />
                <div style={{ position: "absolute", left: base * 0.09, top: -base * 0.03, whiteSpace: "nowrap", background: theme.colors.accent, color: "#1B1F2A", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: base * 0.035, padding: `${base * 0.006}px ${base * 0.018}px`, borderRadius: base * 0.01 }}>
                  {images[i + 1].label}
                </div>
              </div>
            )}
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", top: base * 0.04, left: base * 0.04, right: base * 0.04, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: base * 0.012 }}>
        {images.map((im, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: base * 0.012, opacity: i <= level ? 1 : 0.3 }}>
            {i > 0 && <span style={{ color: "rgba(255,255,255,0.7)", fontSize: base * 0.03 }}>›</span>}
            <span style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: base * 0.032, color: i === idx ? "#1B1F2A" : "#fff", background: i === idx ? theme.colors.accent : "rgba(0,0,0,0.5)", padding: `${base * 0.006}px ${base * 0.018}px`, borderRadius: 999 }}>{im.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
