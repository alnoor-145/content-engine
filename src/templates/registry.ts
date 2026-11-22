import type { ComponentType } from "react";
import type { ZodObject } from "zod";

type AnyZodObject = ZodObject<any>;
import { theme } from "../brand/theme";
import { BarChart, barChartSchema } from "./BarChart";
import { Comparison, comparisonSchema } from "./Comparison";
import { GlitchText, glitchTextSchema } from "./GlitchText";
import { Isometric, isometricSchema } from "./Isometric";
import { KineticText, kineticTextSchema } from "./KineticText";
import { LineDraw, lineDrawSchema } from "./LineDraw";
import { LiquidBlob, liquidBlobSchema } from "./LiquidBlob";
import { ListReveal, listRevealSchema } from "./ListReveal";
import { Particles, particlesSchema } from "./Particles";
import { QuoteCard, quoteCardSchema } from "./QuoteCard";
import { StatCounter, statCounterSchema } from "./StatCounter";
import { ThreeDHero, threeDHeroSchema } from "./ThreeDHero";
import { Timeline, timelineSchema } from "./Timeline";
import { TitleCard, titleCardSchema } from "./TitleCard";
import { TRANSITION_FRAMES, TransitionsReel, transitionsReelSchema } from "./TransitionsReel";
import { Typewriter, typewriterSchema } from "./Typewriter";
import { WordCaptions, wordCaptionsSchema } from "./WordCaptions";

export type TemplateDef = {
  id: string;
  /** Style numbers from research/STYLE_CATALOG.md this template covers. */
  styles: number[];
  component: ComponentType<any>;
  schema: AnyZodObject;
  defaultProps: Record<string, unknown>;
  /** Duration in frames at 30fps, computed from props so data-driven videos size themselves. */
  duration: (props: any) => number;
};

const def = <S extends AnyZodObject>(t: Omit<TemplateDef, "schema" | "defaultProps" | "duration"> & {
  schema: S;
  defaultProps: import("zod").infer<S>;
  duration: (p: import("zod").infer<S>) => number;
}): TemplateDef => t as TemplateDef;

const demoWords = "Stop scrolling this tip will change how you make videos forever".split(" ").map((text, i) => ({ text, startMs: i * 380, endMs: (i + 1) * 380 }));

export const TEMPLATES: TemplateDef[] = [
  def({ id: "TitleCard", styles: [5, 81], component: TitleCard, schema: titleCardSchema, duration: () => 120,
    defaultProps: { title: "My Content Journey", subtitle: "Episode 1 — Getting started", handle: `@${theme.channelName.replace(/\s+/g, "")}` } }),
  def({ id: "KineticText", styles: [1], component: KineticText, schema: kineticTextSchema, duration: (p) => p.lines.length * p.framesPerLine,
    defaultProps: { lines: ["Every big channel", "started with one video", "This is mine"], framesPerLine: 45 } }),
  def({ id: "Typewriter", styles: [2, 24], component: Typewriter, schema: typewriterSchema, duration: (p) => Math.ceil(p.text.length / p.charsPerFrame) + 45,
    defaultProps: { prompt: ">", text: "Did you know? The first YouTube video was 18 seconds long.", charsPerFrame: 0.8 } }),
  def({ id: "GlitchText", styles: [3, 54, 77], component: GlitchText, schema: glitchTextSchema, duration: () => 90,
    defaultProps: { text: "System Update", intensity: 0.7 } }),
  def({ id: "WordCaptions", styles: [4, 91], component: WordCaptions, schema: wordCaptionsSchema, duration: (p) => Math.ceil(((p.words.at(-1)?.endMs ?? 1000) / 1000) * 30) + 15,
    defaultProps: { words: demoWords, wordsPerPage: 3 } }),
  def({ id: "QuoteCard", styles: [6, 55, 84], component: QuoteCard, schema: quoteCardSchema, duration: (p) => 60 + p.quote.split(" ").length * 3 + 30,
    defaultProps: { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" } }),
  def({ id: "StatCounter", styles: [15, 33, 40, 89], component: StatCounter, schema: statCounterSchema, duration: () => 100,
    defaultProps: { from: 0, to: 1000000, prefix: "", suffix: "+", label: "views is the goal", decimals: 0 } }),
  def({ id: "BarChart", styles: [31, 36], component: BarChart, schema: barChartSchema, duration: (p) => 40 + p.bars.length * 6 + 50,
    defaultProps: { title: "Watch time by platform", unit: "h", bars: [{ label: "YouTube", value: 1240 }, { label: "Facebook", value: 860 }, { label: "Shorts", value: 640 }, { label: "Reels", value: 410 }] } }),
  def({ id: "ListReveal", styles: [17, 21, 22, 26, 39], component: ListReveal, schema: listRevealSchema, duration: (p) => 15 + p.items.length * p.framesPerItem + 40,
    defaultProps: { title: "Top 5 tools for creators", countdown: true, framesPerItem: 20, items: [
      { icon: "🎬", text: "Remotion" }, { icon: "🎨", text: "Figma" }, { icon: "🧊", text: "Blender" }, { icon: "🎙️", text: "Audacity" }, { icon: "✂️", text: "DaVinci Resolve" }] } }),
  def({ id: "Comparison", styles: [20, 90], component: Comparison, schema: comparisonSchema, duration: () => 120,
    defaultProps: { left: { title: "Shorts", points: ["Fast reach", "Under 60s", "Vertical"] }, right: { title: "Long-form", points: ["Deep watch time", "Higher RPM", "Horizontal"] } } }),
  def({ id: "Timeline", styles: [19], component: Timeline, schema: timelineSchema, duration: (p) => 10 + p.events.length * p.framesPerEvent + 40,
    defaultProps: { title: "My journey", framesPerEvent: 25, events: [
      { date: "Nov 2026", text: "Built my content engine" }, { date: "Dec 2026", text: "First 10 videos" }, { date: "2027", text: "1,000 subscribers" }] } }),
  def({ id: "LineDraw", styles: [11, 16, 29, 30, 49], component: LineDraw, schema: lineDrawSchema, duration: () => 150,
    defaultProps: { caption: "Idea → Script → Animate → Publish", paper: "whiteboard", paths: [
      "M 200 500 m -90 0 a 90 90 0 1 0 180 0 a 90 90 0 1 0 -180 0",
      "M 300 500 L 420 500 M 400 480 L 420 500 L 400 520",
      "M 460 410 L 640 410 L 640 590 L 460 590 Z",
      "M 680 500 L 780 500 M 760 480 L 780 500 L 760 520",
      "M 820 420 L 900 500 L 820 580 Z"] } }),
  def({ id: "Particles", styles: [45], component: Particles, schema: particlesSchema, duration: () => 150,
    defaultProps: { title: "Into the future", count: 250, mode: "starfield" } }),
  def({ id: "LiquidBlob", styles: [44], component: LiquidBlob, schema: liquidBlobSchema, duration: () => 150,
    defaultProps: { title: "Flow state", subtitle: "Create every day" } }),
  def({ id: "Isometric", styles: [43, 46], component: Isometric, schema: isometricSchema, duration: () => 150,
    defaultProps: { title: "Build it block by block", heights: [1, 2, 3, 2, 2, 3, 4, 3, 1, 4, 5, 2, 0, 2, 3, 1] } }),
  def({ id: "ThreeDHero", styles: [59, 60, 67], component: ThreeDHero, schema: threeDHeroSchema, duration: () => 150,
    defaultProps: { title: "Next level", shape: "torusKnot", flatShading: false } }),
  def({ id: "TransitionsReel", styles: [69, 70, 71, 72, 73], component: TransitionsReel, schema: transitionsReelSchema,
    duration: (p) => p.scenes.length * p.framesPerScene - (p.scenes.length - 1) * TRANSITION_FRAMES,
    defaultProps: { scenes: ["Fade", "Slide", "Wipe", "Flip", "Clock wipe", "Done"], framesPerScene: 45 } }),
];
