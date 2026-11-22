import { useAudioData, type MediaUtilsAudioData } from "@remotion/media-utils";
import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Easing, cancelRender, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../brand/theme";
import { clamp, useBase } from "../lib/useBase";
import { BACKGROUNDS, DEPTH, EXTRAS, buildLayers, type Extra } from "../story/backgrounds";
import { Character, EMOTIONS, RIG_HEIGHT, TYPE_SCALE, lookSchema, type Emotion, type Gesture, type Look } from "../story/Character";
import { activeLine, audioLevel, audioPeak, linesFromSrt, syntheticMouth, visemeFor, wordTimings, type Line } from "../story/speech";
import type { Env } from "../story/nature";

const castSchema = z.object({
  id: z.string(),
  x: z.number(), // 0..1 of the frame width
  facing: z.enum(["left", "right"]).optional(),
  walk: z.array(z.object({ from: z.number(), to: z.number(), x: z.number() })).optional(),
  gestures: z.array(z.object({ from: z.number(), to: z.number(), type: z.enum(["wave", "point", "explain", "cheer"]) })).optional(),
  emotions: z.array(z.object({ at: z.number(), value: z.enum(EMOTIONS) })).optional(),
});

const sceneSchema = z.object({
  start: z.number(),
  end: z.number(),
  background: z.enum(BACKGROUNDS),
  time: z.enum(["day", "sunset", "night"]),
  extras: z.array(z.enum(EXTRAS)),
  camera: z.enum(["wide", "speaker", "pushIn", "pullOut", "panRight", "panLeft"]),
  transition: z.enum(["cut", "fade", "iris", "wipe", "zoom"]),
  title: z.string(),
  cast: z.array(castSchema),
});

export const storySceneSchema = z.object({
  characters: z.array(lookSchema),
  // Lines in seconds. Ignored when srtSrc is set (then "Name: text" in the SRT picks the speaker).
  lines: z.array(z.object({ speaker: z.string(), text: z.string(), start: z.number(), end: z.number() })),
  voiceSrc: z.string(),
  srtSrc: z.string(),
  musicSrc: z.string(),
  musicVolume: z.number().min(0).max(1),
  subtitles: z.enum(["karaoke", "line", "off"]),
  scenes: z.array(sceneSchema).min(1),
});

type Props = z.infer<typeof storySceneSchema>;
type Scene = z.infer<typeof sceneSchema>;
type Cast = z.infer<typeof castSchema>;

const PRESET_EXTRAS: Record<Scene["background"], Extra[]> = {
  village: ["birds", "butterflies", "smoke"],
  river: ["boat", "birds"],
  road: ["car"],
  field: ["birds", "butterflies"],
  night: ["fireflies", "smoke"],
};
const TR = 0.7; // transition length in seconds
const ease = Easing.inOut(Easing.cubic);

// ── per-character state ──
const castX = (m: Cast, t: number) => {
  let x = m.x;
  let dist = 0;
  let walking = false;
  let dir = 0;
  for (const s of m.walk ?? []) {
    if (t >= s.to) {
      dist += Math.abs(s.x - x);
      x = s.x;
    } else if (t > s.from) {
      const p = (t - s.from) / (s.to - s.from);
      const nx = x + (s.x - x) * p;
      dist += Math.abs(nx - x);
      dir = Math.sign(s.x - x);
      x = nx;
      walking = true;
      break;
    } else break;
  }
  return { x, dist, walking, dir };
};

const useSrtLines = (src: string, characters: Look[]) => {
  const [lines, setLines] = useState<Line[] | null>(null);
  const [handle] = useState(() => (src ? delayRender(`Loading subtitles ${src}`) : null));
  useEffect(() => {
    if (!src || handle === null) return;
    fetch(staticFile(src))
      .then((r) => r.text())
      .then((txt) => {
        setLines(linesFromSrt(txt, characters));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [src, handle, characters]);
  return lines;
};

// ── one scene, fully drawn at story time t ──
const SceneView: React.FC<{ scene: Scene; t: number; lines: Line[]; looks: Look[]; audio: { data: MediaUtilsAudioData; peak: number } | null }> = ({ scene, t, lines, looks, audio }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const base = useBase();
  const portrait = h > w;
  const time = scene.background === "night" ? "night" : scene.time;
  const horizonY = h * (portrait ? 0.6 : 0.56);
  const groundY = h * (portrait ? 0.84 : 0.82);
  const e: Env = { w, h, base, f: frame, tl: t - scene.start, horizonY, groundY, time, seed: `s${scene.start}` };
  const extras = Array.from(new Set([...PRESET_EXTRAS[scene.background], ...scene.extras]));
  const layers = buildLayers(scene.background, e, extras, t - scene.start, scene.end - scene.start);
  const charPx = base * (portrait ? 0.62 : 0.42);
  const fy = groundY - charPx * 0.55;

  // ── camera ──
  const target = (tt: number) => {
    const dur = scene.end - scene.start;
    const p = ease(Math.min(1, Math.max(0, (tt - scene.start) / dur)));
    const xs = scene.cast.map((m) => castX(m, tt).x);
    const mid = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0.5;
    switch (scene.camera) {
      case "pushIn": return { zoom: 1 + 0.35 * p, fx: 0.5 + (mid - 0.5) * p };
      case "pullOut": return { zoom: 1.4 - 0.4 * p, fx: mid + (0.5 - mid) * p };
      case "panRight": return { zoom: 1.25, fx: 0.38 + 0.24 * p };
      case "panLeft": return { zoom: 1.25, fx: 0.62 - 0.24 * p };
      case "speaker": {
        const l = activeLine(lines, tt);
        const sp = l ? scene.cast.find((m) => m.id === l.speaker) : undefined;
        return sp ? { zoom: 1.45, fx: castX(sp, tt).x } : { zoom: 1.12, fx: mid };
      }
      default: return { zoom: 1, fx: 0.5 };
    }
  };
  // Smooth the camera by averaging its target over the last ~0.5 s (deterministic, no state).
  const samples = scene.camera === "speaker" ? 16 : 1;
  let zoom = 0;
  let fx = 0;
  for (let k = 0; k < samples; k++) {
    const tt = Math.max(scene.start, t - k / fps);
    const c = target(tt);
    zoom += c.zoom / samples;
    fx += c.fx / samples;
  }
  const layer = (d: number) => {
    const z = 1 + (zoom - 1) * d;
    const Fx = w / 2 + (fx * w - w / 2) * d;
    return `translate(${w / 2} ${fy}) scale(${z}) translate(${-Fx} ${-fy})`;
  };

  // ── characters ──
  const line = activeLine(lines, t);
  const speaker = line ? scene.cast.find((m) => m.id === line.speaker) : undefined;
  const speakerX = speaker ? castX(speaker, t).x : null;
  const tint = time === "night" ? "brightness(0.68) saturate(0.8)" : time === "sunset" ? "brightness(0.9) sepia(0.18)" : "none";

  const people = scene.cast.map((m) => {
    const look = looks.find((l) => l.id === m.id);
    if (!look) return null;
    const pos = castX(m, t);
    const others = scene.cast.filter((o) => o.id !== m.id).map((o) => castX(o, t).x);
    const talking = !!line && line.speaker === m.id;
    let facing: 1 | -1 = 1;
    if (pos.walking) facing = pos.dir < 0 ? -1 : 1;
    else if (speakerX !== null && !talking) facing = speakerX < pos.x ? -1 : 1;
    else if (m.facing) facing = m.facing === "left" ? -1 : 1;
    else if (others.length) facing = others.reduce((a, b) => a + b, 0) / others.length < pos.x ? -1 : 1;

    let mouth = 0;
    let key = "rest";
    if (talking && line) {
      if (audio) {
        mouth = audioLevel(audio.data, t, audio.peak);
        key = `${m.id}-${Math.floor(t * 8)}`;
      } else {
        const s = syntheticMouth(line, t);
        mouth = s.open;
        key = s.key;
      }
    }
    const period = 95 + Math.floor(random(`blink-${m.id}`) * 55);
    const ph = (frame + Math.floor(random(`blo-${m.id}`) * 100)) % period;
    const blink = ph < 2 ? 1 : ph < 4 ? 0.55 : 0;
    const emotion: Emotion = [...(m.emotions ?? [])].filter((x) => x.at <= t).pop()?.value ?? "neutral";
    const g = (m.gestures ?? []).find((x) => t >= x.from && t < x.to);
    const gesture: Gesture = g ? g.type : talking ? "explain" : "none";
    const s = (charPx / RIG_HEIGHT) * TYPE_SCALE[look.type];
    return (
      <g key={m.id} transform={`translate(${pos.x * w} ${groundY})`}>
        <ellipse cx={0} cy={0} rx={charPx * 0.16} ry={charPx * 0.03} fill="rgba(0,0,0,0.25)" />
        <g transform={`scale(${s * facing} ${s})`}>
          <Character
            look={look}
            pose={{ t: t + random(`ph-${m.id}`) * 10, mouth, viseme: visemeFor(mouth, key), blink, emotion, gesture, walking: pos.walking, walkPhase: ((pos.dist * w) / (base * 0.09)) * Math.PI, lookX: talking ? 0.5 : speakerX !== null ? 0.7 : 0.2, talking }}
          />
        </g>
      </g>
    );
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={layer(DEPTH.sky)}>{layers.sky}</g>
        <g transform={layer(DEPTH.far)}>{layers.far}</g>
        <g transform={layer(DEPTH.mid)}>{layers.mid}</g>
        <g transform={layer(DEPTH.near)}>{layers.near}</g>
        <g transform={layer(DEPTH.near)} style={{ filter: tint }}>{people}</g>
        <g transform={layer(DEPTH.fore)}>{layers.fore}</g>
      </svg>
      {time === "night" && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,20,0.45))" }} />}
    </AbsoluteFill>
  );
};

const Subtitles: React.FC<{ lines: Line[]; looks: Look[]; t: number; mode: Props["subtitles"] }> = ({ lines, looks, t, mode }) => {
  const { fps, width: w } = useVideoConfig();
  const base = useBase();
  const line = activeLine(lines, t);
  if (!line || mode === "off") return null;
  const look = looks.find((l) => l.id === line.speaker);
  const pop = spring({ frame: Math.round((t - line.start) * fps), fps, config: { damping: 16 } });
  const words = wordTimings(line);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: base * 0.05, display: "flex", justifyContent: "center", opacity: pop, transform: `translateY(${(1 - pop) * base * 0.03}px)` }}>
      <div style={{ maxWidth: w * 0.9, background: "rgba(0,0,0,0.6)", borderRadius: base * 0.025, padding: `${base * 0.018}px ${base * 0.035}px`, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fonts.bangla, fontWeight: 700, fontSize: base * 0.03, color: look?.color ?? theme.colors.muted, marginBottom: base * 0.004 }}>{look?.name ?? "বর্ণনা"}</div>
        <div style={{ fontFamily: theme.fonts.bangla, fontWeight: 700, fontSize: base * 0.052, lineHeight: 1.35, color: "#fff" }}>
          {mode === "line"
            ? line.text
            : words.map((wd, i) => {
                const now = t >= wd.start && t < wd.end;
                const said = t >= wd.end;
                return (
                  <span key={i} style={{ color: now ? theme.colors.accent : said ? "#fff" : "rgba(255,255,255,0.55)", display: "inline-block", transform: `scale(${now ? 1.08 : 1})`, marginRight: base * 0.012 }}>
                    {wd.word}
                  </span>
                );
              })}
        </div>
      </div>
    </div>
  );
};

const Story: React.FC<Props & { audio: { data: MediaUtilsAudioData; peak: number } | null }> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = useBase();
  const t = frame / fps;
  const srtLines = useSrtLines(props.srtSrc, props.characters);
  const lines: Line[] = props.srtSrc ? srtLines ?? [] : props.lines;
  const scenes = [...props.scenes].sort((a, b) => a.start - b.start);
  let i = 0;
  scenes.forEach((s, k) => { if (t >= s.start) i = k; });

  // Transition window around each scene boundary.
  const next = scenes[i + 1];
  const prev = scenes[i - 1];
  let out: Scene | null = null;
  let inc: Scene = scenes[i];
  let p = 1;
  if (next && t > next.start - TR / 2 && next.transition !== "cut") {
    out = scenes[i];
    inc = next;
    p = (t - (next.start - TR / 2)) / TR;
  } else if (prev && t < scenes[i].start + TR / 2 && scenes[i].transition !== "cut") {
    out = prev;
    p = (t - (scenes[i].start - TR / 2)) / TR;
  }
  const pe = ease(Math.min(1, Math.max(0, p)));
  const type = inc.transition;
  const incStyle: React.CSSProperties = !out
    ? {}
    : type === "fade" ? { opacity: pe }
    : type === "iris" ? { clipPath: `circle(${pe * 80}% at 50% 50%)` }
    : type === "wipe" ? { clipPath: `inset(0 ${(1 - pe) * 100}% 0 0)` }
    : { opacity: pe, transform: `scale(${1.25 - 0.25 * pe})` };
  const outStyle: React.CSSProperties = out && type === "zoom" ? { transform: `scale(${1 + pe * 0.6})`, opacity: 1 - pe } : {};

  const title = scenes[i].title;
  const titleO = title ? interpolate(t, [scenes[i].start + 0.4, scenes[i].start + 1, scenes[i].end - 0.5, scenes[i].end - 0.1], [0, 1, 1, 0], clamp) : 0;
  const lineTimes = lines.map((l) => [l.start - 0.15, l.end + 0.15]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {out && <AbsoluteFill style={outStyle}><SceneView scene={out} t={t} lines={lines} looks={props.characters} audio={props.audio} /></AbsoluteFill>}
      <AbsoluteFill style={incStyle}><SceneView scene={inc} t={t} lines={lines} looks={props.characters} audio={props.audio} /></AbsoluteFill>
      {title && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: base * 0.12, opacity: titleO }}>
          <div style={{ fontFamily: theme.fonts.bangla, fontWeight: 700, fontSize: base * 0.12, color: "#fff", textShadow: `0 ${base * 0.008}px ${base * 0.03}px rgba(0,0,0,0.6)`, transform: `scale(${0.9 + titleO * 0.1})` }}>{title}</div>
        </AbsoluteFill>
      )}
      <Subtitles lines={lines} looks={props.characters} t={t} mode={props.subtitles} />
      {props.voiceSrc && <Audio src={staticFile(props.voiceSrc)} />}
      {props.musicSrc && (
        <Audio
          src={staticFile(props.musicSrc)}
          loop
          volume={(f) => {
            const tt = f / fps;
            const talking = lineTimes.some(([a, b]) => tt >= a && tt < b);
            return talking ? props.musicVolume * 0.3 : props.musicVolume; // duck music under the voice
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const StoryWithVoice: React.FC<Props> = (props) => {
  const data = useAudioData(staticFile(props.voiceSrc));
  const peak = useMemo(() => (data ? audioPeak(data) : 1), [data]);
  if (!data) return null;
  return <Story {...props} audio={{ data, peak }} />;
};

// Cartoon story engine: characters talk with lip-sync (from your voice file, or from the text timing),
// blink, gesture, walk and react; nature scenes (village, river, road, field, night) with sun/moon, clouds,
// swaying trees, boats, birds, cars, rain and fireflies; camera follows the speaker, pushes in or pans;
// scenes change with fade / iris / wipe / zoom; Bangla karaoke subtitles; background music ducks under voice.
export const StoryScene: React.FC<Props> = (props) => (props.voiceSrc ? <StoryWithVoice {...props} /> : <Story {...props} audio={null} />);
