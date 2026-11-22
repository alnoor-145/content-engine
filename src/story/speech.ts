import { parseSrt } from "@remotion/captions";
import type { MediaUtilsAudioData } from "@remotion/media-utils";
import { random } from "remotion";
import { graphemes } from "../lib/text";

// A spoken line, in seconds. speaker = a character id, or "narrator".
export type Line = { speaker: string; text: string; start: number; end: number };
export type Viseme = "rest" | "open" | "wide" | "round" | "teeth";

export const activeLine = (lines: Line[], t: number) => lines.find((l) => t >= l.start && t < l.end);

// Estimated word timings inside a line (no forced alignment needed): longer words and
// words before punctuation get more time. Good enough for karaoke subtitles and lip motion.
export const wordTimings = (line: Line) => {
  const words = line.text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => graphemes(w).length + 1 + (/[,.!?।;:]$/.test(w) ? 2 : 0));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const dur = line.end - line.start;
  let acc = line.start;
  return words.map((word, i) => {
    const d = (dur * weights[i]) / total;
    const start = acc;
    acc += d;
    return { word, start, end: start + d * 0.86 };
  });
};

// Mouth openness from text timing (when there is no voice file).
export const syntheticMouth = (line: Line, t: number) => {
  const words = wordTimings(line);
  const wi = words.findIndex((x) => t >= x.start && t < x.end);
  if (wi < 0) return { open: 0, key: "gap" };
  const w = words[wi];
  const syllables = Math.max(1, Math.round(graphemes(w.word).length / 2.2));
  const ph = ((t - w.start) / (w.end - w.start)) * syllables;
  const idx = Math.floor(ph);
  return { open: 0.12 + 0.88 * Math.pow(Math.sin(Math.PI * (ph - idx)), 0.8), key: `${line.start}-${wi}-${idx}` };
};

export const visemeFor = (open: number, key: string): Viseme => {
  if (open < 0.18) return "rest";
  const r = random(key);
  if (open > 0.7) return r < 0.6 ? "wide" : "open";
  return r < 0.3 ? "round" : r < 0.55 ? "teeth" : "open";
};

// Loudness of the voice file around time t (RMS of ±25 ms), 0..1 relative to the loudest moment.
export const audioPeak = (data: MediaUtilsAudioData) => {
  const ch = data.channelWaveforms[0];
  const win = Math.floor(data.sampleRate * 0.05);
  let peak = 0;
  for (let s = 0; s + win < ch.length; s += win) {
    let sum = 0;
    for (let i = s; i < s + win; i += 8) sum += ch[i] * ch[i];
    peak = Math.max(peak, Math.sqrt(sum / (win / 8)));
  }
  return peak || 1;
};

export const audioLevel = (data: MediaUtilsAudioData, t: number, peak: number) => {
  const ch = data.channelWaveforms[0];
  const c = Math.floor(t * data.sampleRate);
  const half = Math.floor(data.sampleRate * 0.025);
  let sum = 0;
  let n = 0;
  for (let i = Math.max(0, c - half); i < Math.min(ch.length, c + half); i += 4) {
    sum += ch[i] * ch[i];
    n++;
  }
  const rms = n ? Math.sqrt(sum / n) : 0;
  return Math.min(1, rms / (peak * 0.5));
};

// SRT → lines. "Name: text" assigns the line to that character (by id or display name); otherwise narrator.
export const linesFromSrt = (srt: string, cast: { id: string; name: string }[]): Line[] =>
  parseSrt({ input: srt }).captions.map((c) => {
    const flat = c.text.replace(/\s*\n\s*/g, " ").trim();
    const m = flat.match(/^([^:：]{1,24})[:：]\s*(.+)$/);
    if (m) {
      const who = m[1].trim().toLowerCase();
      const hit = cast.find((p) => p.id.toLowerCase() === who || p.name.toLowerCase() === who);
      if (hit) return { speaker: hit.id, text: m[2].trim(), start: c.startMs / 1000, end: c.endMs / 1000 };
    }
    return { speaker: "narrator", text: flat, start: c.startMs / 1000, end: c.endMs / 1000 };
  });
