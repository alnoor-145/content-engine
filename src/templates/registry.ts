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
import { AudioWave, audioWaveSchema } from "./AudioWave";
import { BarChartRace, barChartRaceSchema } from "./BarChartRace";
import { ChapterBar, chapterBarSchema } from "./ChapterBar";
import { ChatStory, chatStorySchema } from "./ChatStory";
import { CodeBlock, codeBlockSchema } from "./CodeBlock";
import { DonutChart, donutChartSchema } from "./DonutChart";
import { EndScreen, endScreenSchema } from "./EndScreen";
import { Flowchart, flowchartSchema } from "./Flowchart";
import { Globe, globeSchema } from "./Globe";
import { HighlightText, highlightTextSchema } from "./HighlightText";
import { LineChart, lineChartSchema } from "./LineChart";
import { MaskReveal, maskRevealSchema } from "./MaskReveal";
import { NewsTicker, newsTickerSchema } from "./NewsTicker";
import { NotificationPop, notificationPopSchema } from "./NotificationPop";
import { Pictogram, pictogramSchema } from "./Pictogram";
import { ScrambleText, scrambleTextSchema } from "./ScrambleText";
import { SplitFlap, splitFlapSchema } from "./SplitFlap";
import { SubscribeCTA, subscribeCtaSchema } from "./SubscribeCTA";
import { ClayScene, claySceneSchema } from "./ClayScene";
import { DeviceMockup, deviceMockupSchema } from "./DeviceMockup";
import { Equation, equationSchema } from "./Equation";
import { ExplodedView, explodedViewSchema } from "./ExplodedView";
import { ExtrudedText, extrudedTextSchema } from "./ExtrudedText";
import { LottieScene, lottieSceneSchema } from "./LottieScene";
import { MapHeatmap, mapHeatmapSchema } from "./MapHeatmap";
import { MapRoute, mapRouteSchema } from "./MapRoute";
import { MorphShapes, morphShapesSchema } from "./MorphShapes";
import { PaperCutout, paperCutoutSchema } from "./PaperCutout";
import { Patterns, patternsSchema } from "./Patterns";
import { PhotoFX, photoFXSchema } from "./PhotoFX";
import { PixelArt, pixelArtSchema } from "./PixelArt";
import { RoughSketch, roughSketchSchema } from "./RoughSketch";
import { SoftUI, softUISchema } from "./SoftUI";
import { TextOnPath, textOnPathSchema } from "./TextOnPath";
import { TRANSITION2_FRAMES, TransitionsReel2, transitionsReel2Schema } from "./TransitionsReel2";
import { VoxelWorld, voxelWorldSchema } from "./VoxelWorld";

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

  // ── Social, branding & UI ─────────────────────────────────────────────
  def({ id: "SubscribeCTA", styles: [82], component: SubscribeCTA, schema: subscribeCtaSchema, duration: () => 130,
    defaultProps: { channelName: theme.channelName, tagline: "New motion graphics every week", subscribeText: "Subscribe", subscribedText: "Subscribed", likeText: "Like" } }),
  def({ id: "EndScreen", styles: [83], component: EndScreen, schema: endScreenSchema, duration: () => 600,
    defaultProps: { heading: "Watch next", channelName: theme.channelName, videoLabels: ["Latest video", "Best for you"] } }),
  def({ id: "ChatStory", styles: [85, 86], component: ChatStory, schema: chatStorySchema, duration: (p) => 10 + p.messages.length * p.framesPerMessage + 45,
    defaultProps: { contactName: "Rafi", status: "online", framesPerMessage: 28, messages: [
      { from: "them", text: "Bro, how do you make those animations? 😮" },
      { from: "me", text: "I built my own engine. It's all code!" },
      { from: "them", text: "No way. Is it hard?" },
      { from: "me", text: "One JSON file → video for YouTube AND Facebook" },
      { from: "them", text: "Teach me 🙏" },
      { from: "me", text: "Follow the channel 😎" }] } }),
  def({ id: "NotificationPop", styles: [87], component: NotificationPop, schema: notificationPopSchema, duration: (p) => 8 + p.notifications.length * p.framesPerNotification + 50,
    defaultProps: { framesPerNotification: 22, notifications: [
      { app: "YouTube", icon: "▶️", title: "Your video hit 10K views", body: "Keep the momentum going!" },
      { app: "Facebook", icon: "👍", title: "1,240 people reacted", body: "Your reel is trending" },
      { app: "Studio", icon: "💰", title: "Monetization approved", body: "Congratulations 🎉" }] } }),
  def({ id: "NewsTicker", styles: [41], component: NewsTicker, schema: newsTickerSchema, duration: () => 240,
    defaultProps: { label: "BREAKING", headline: "Local creator builds own animation engine", subheadline: "35 motion graphics styles, fully open source", tickerSpeed: 6, tickerItems: ["New video every Friday", "Shorts daily", "Subscribe for more", "Open source on GitHub"] } }),
  def({ id: "ChapterBar", styles: [88], component: ChapterBar, schema: chapterBarSchema, duration: (p) => Math.round(p.chapters.reduce((a, c) => a + c.seconds, 0) * 30),
    defaultProps: { chapters: [{ title: "Intro", seconds: 2 }, { title: "The idea", seconds: 3 }, { title: "How it works", seconds: 3 }, { title: "Results", seconds: 2 }] } }),

  // ── More typography ───────────────────────────────────────────────────
  def({ id: "ScrambleText", styles: [9], component: ScrambleText, schema: scrambleTextSchema, duration: (p) => p.lines.length * p.framesPerLine,
    defaultProps: { lines: ["ACCESS GRANTED", "THE SECRET IS OUT", "আসল রহস্য"], framesPerLine: 60 } }),
  def({ id: "MaskReveal", styles: [10], component: MaskReveal, schema: maskRevealSchema, duration: (p) => 10 + p.lines.length * 10 + 80,
    defaultProps: { kicker: "EPISODE 01", lines: ["The story", "nobody tells you"] } }),
  def({ id: "HighlightText", styles: [13], component: HighlightText, schema: highlightTextSchema, duration: (p) => 10 + p.text.split(" ").length * 3 + 5 + p.highlights.length * 12 + 45,
    defaultProps: { text: "Consistency beats talent when talent does not show up every day.", highlights: ["Consistency", "every", "day."] } }),
  def({ id: "SplitFlap", styles: [8], component: SplitFlap, schema: splitFlapSchema, duration: (p) => 8 + p.lines.length * 6 + Math.max(...p.lines.map((l) => l.length)) * 2.2 + 14 + 50,
    defaultProps: { label: "NOW BOARDING", lines: ["NEXT STOP", "1M VIEWS"] } }),
  def({ id: "CodeBlock", styles: [24], component: CodeBlock, schema: codeBlockSchema, duration: (p) => 10 + Math.ceil(p.code.length / p.charsPerFrame) + 45,
    defaultProps: { filename: "engine.ts", charsPerFrame: 2.5, code: "// render one video for every platform\nconst formats = [\"youtube\", \"short\", \"fbFeed\"];\n\nfor (const f of formats) {\n  await render(\"KineticText\", f);\n}\nconsole.log(\"Done in\", 42, \"seconds\");" } }),

  // ── More data & infographics ──────────────────────────────────────────
  def({ id: "LineChart", styles: [34], component: LineChart, schema: lineChartSchema, duration: () => 130,
    defaultProps: { title: "Subscribers per month", unit: "", points: [{ label: "Jan", value: 120 }, { label: "Feb", value: 340 }, { label: "Mar", value: 310 }, { label: "Apr", value: 780 }, { label: "May", value: 1250 }, { label: "Jun", value: 2400 }] } }),
  def({ id: "DonutChart", styles: [35], component: DonutChart, schema: donutChartSchema, duration: () => 120,
    defaultProps: { title: "Where my views come from", centerLabel: "of views", segments: [{ label: "YouTube Shorts", value: 45 }, { label: "Facebook Reels", value: 30 }, { label: "Long videos", value: 25 }] } }),
  def({ id: "BarChartRace", styles: [32], component: BarChartRace, schema: barChartRaceSchema, duration: (p) => 15 + (p.steps.length - 1) * p.framesPerStep + 60,
    defaultProps: { title: "Most used social apps (millions)", unit: "M", framesPerStep: 45, topN: 5, steps: [
      { label: "2018", values: { Facebook: 2200, YouTube: 1900, WhatsApp: 1500, Instagram: 1000, TikTok: 270 } },
      { label: "2020", values: { Facebook: 2600, YouTube: 2000, WhatsApp: 2000, Instagram: 1200, TikTok: 690 } },
      { label: "2022", values: { Facebook: 2900, YouTube: 2500, WhatsApp: 2000, Instagram: 2000, TikTok: 1000 } },
      { label: "2024", values: { Facebook: 3000, YouTube: 2500, WhatsApp: 2000, Instagram: 2000, TikTok: 1580 } }] } }),
  def({ id: "Pictogram", styles: [37], component: Pictogram, schema: pictogramSchema, duration: () => 120,
    defaultProps: { title: "viewers never subscribe", total: 100, highlighted: 90, caption: "Be the reason the other 10 do." } }),

  // ── Explainers, 3D & audio ────────────────────────────────────────────
  def({ id: "Flowchart", styles: [18], component: Flowchart, schema: flowchartSchema, duration: (p) => 10 + p.steps.length * p.framesPerStep + 40,
    defaultProps: { title: "My content workflow", framesPerStep: 20, steps: [{ icon: "💡", label: "Idea" }, { icon: "📝", label: "Script" }, { icon: "🎬", label: "Animate" }, { icon: "🚀", label: "Publish" }] } }),
  def({ id: "Globe", styles: [65], component: Globe, schema: globeSchema, duration: () => 180,
    defaultProps: { title: "Worldwide audience", subtitle: "Dhaka → London → New York → Dubai", connect: true, markers: [{ lat: 23.8, lon: 90.4 }, { lat: 51.5, lon: -0.1 }, { lat: 40.7, lon: -74 }, { lat: 25.2, lon: 55.3 }] } }),
  def({ id: "AudioWave", styles: [53, 92], component: AudioWave, schema: audioWaveSchema, duration: (p) => Math.round(p.durationSeconds * 30),
    defaultProps: { title: "The Creator Podcast", subtitle: "Episode 1 · Starting from zero", audioSrc: "", durationSeconds: 6 } }),

  // ── Batch 3: text, maps, math, illustration looks ─────────────────────
  def({ id: "ExtrudedText", styles: [12], component: ExtrudedText, schema: extrudedTextSchema, duration: () => 150,
    defaultProps: { lines: ["Level", "Up"], depth: 22, faceColor: "#FFD84D", sideColor: "#C2410C" } }),
  def({ id: "TextOnPath", styles: [14], component: TextOnPath, schema: textOnPathSchema, duration: () => 180,
    defaultProps: { text: "SUBSCRIBE FOR MORE MOTION GRAPHICS", centerText: "NEW EVERY WEEK", shape: "circle", speed: 1.2 } }),
  def({ id: "MapRoute", styles: [25], component: MapRoute, schema: mapRouteSchema, duration: (p) => 20 + (p.stops.length - 1) * p.framesPerLeg + 50,
    defaultProps: { title: "From Dhaka to the world", view: "route", framesPerLeg: 40, stops: [
      { name: "Dhaka", lat: 23.81, lon: 90.41 }, { name: "Dubai", lat: 25.2, lon: 55.27 }, { name: "Istanbul", lat: 41.01, lon: 28.98 }, { name: "London", lat: 51.51, lon: -0.13 }] } }),
  def({ id: "MapHeatmap", styles: [38], component: MapHeatmap, schema: mapHeatmapSchema, duration: (p) => 15 + Object.keys(p.values).length * 4 + 15 + 75,
    defaultProps: { title: "Viewers by country (demo data)", unit: "K", zoomToData: false, values: {
      Bangladesh: 120, India: 64, "United States of America": 38, "United Kingdom": 22, "Saudi Arabia": 30, "United Arab Emirates": 18, Malaysia: 14, Canada: 9, Australia: 7, Italy: 6, Qatar: 8, Pakistan: 11 } } }),
  def({ id: "Equation", styles: [23], component: Equation, schema: equationSchema, duration: (p) => 10 + p.steps.length * p.framesPerStep + 60,
    defaultProps: { title: "Pythagoras in 4 steps", framesPerStep: 40, caption: "The longest side is 5", steps: ["a^2 + b^2 = c^2", "3^2 + 4^2 = c^2", "9 + 16 = c^2", "c = \\sqrt{25} = 5"] } }),
  def({ id: "RoughSketch", styles: [100], component: RoughSketch, schema: roughSketchSchema, duration: (p) => 15 + (p.boxes.length * 2 - 1) * p.framesPerShape + 45,
    defaultProps: { title: "How a video goes viral", framesPerShape: 18, boxes: ["Hook", "Watch time", "Shares", "Algorithm"] } }),
  def({ id: "PaperCutout", styles: [28], component: PaperCutout, schema: paperCutoutSchema, duration: () => 150,
    defaultProps: { title: "Once upon a time…", subtitle: "A story in paper", palette: "sunset" } }),
  def({ id: "PixelArt", styles: [98], component: PixelArt, schema: pixelArtSchema, duration: () => 150,
    defaultProps: { title: "LEVEL 1", subtitle: "PRESS START", coins: 6 } }),

  // ── Batch 3: shapes, patterns, UI, photo ──────────────────────────────
  def({ id: "MorphShapes", styles: [48], component: MorphShapes, schema: morphShapesSchema, duration: (p) => p.labels.length * p.framesPerShape,
    defaultProps: { labels: ["Idea", "Spark", "Love it", "Grow", "Build", "Launch"], framesPerShape: 36 } }),
  def({ id: "Patterns", styles: [50, 51, 52], component: Patterns, schema: patternsSchema, duration: () => 180,
    defaultProps: { mode: "bauhaus", title: "Design matters", subtitle: "Form follows function" } }),
  def({ id: "SoftUI", styles: [56], component: SoftUI, schema: softUISchema, duration: () => 130,
    defaultProps: { title: "Focus mode", value: 78, label: "goal reached", toggleLabel: "Notifications off" } }),
  def({ id: "PhotoFX", styles: [57, 58, 61, 74], component: PhotoFX, schema: photoFXSchema, duration: () => 150,
    defaultProps: { src: "demo-photo.jpg", mode: "parallax", title: "Chapter 1", subtitle: "Where it all began" } }),

  // ── Batch 3: 3D ───────────────────────────────────────────────────────
  def({ id: "VoxelWorld", styles: [62, 66], component: VoxelWorld, schema: voxelWorldSchema, duration: () => 240,
    defaultProps: { title: "Build your world", subtitle: "Block by block", seed: "creator" } }),
  def({ id: "DeviceMockup", styles: [63, 86], component: DeviceMockup, schema: deviceMockupSchema, duration: (p) => 40 + p.feed.length * 25 + 50,
    defaultProps: { appTitle: "My Channel", caption: "Watch on any screen", feed: ["Episode 1: Start", "Top 5 tools", "Behind the scenes", "Q&A live", "What's next"] } }),
  def({ id: "ExplodedView", styles: [68], component: ExplodedView, schema: explodedViewSchema, duration: () => 150,
    defaultProps: { title: "Inside a smartphone", layers: ["Glass", "Display", "Battery", "Logic board", "Back cover"] } }),
  def({ id: "ClayScene", styles: [64, 99], component: ClayScene, schema: claySceneSchema, duration: () => 180,
    defaultProps: { title: "Made by hand", subtitle: "Stop-motion vibes", stepFrames: 2 } }),

  // ── Batch 3: transitions & Lottie ─────────────────────────────────────
  def({ id: "TransitionsReel2", styles: [75, 76, 78, 79], component: TransitionsReel2, schema: transitionsReel2Schema,
    duration: (p) => p.scenes.length * p.framesPerScene - (p.scenes.length - 1) * TRANSITION2_FRAMES,
    defaultProps: { scenes: ["Circle iris", "Star mask", "Whip pan", "Ink splash", "Light leak", "Diamond", "Done"], framesPerScene: 50 } }),
  def({ id: "LottieScene", styles: [27, 93, 97], component: LottieScene, schema: lottieSceneSchema, duration: () => 150,
    defaultProps: { src: "", title: "Lottie animations", subtitle: "Drop any LottieFiles .json into public/", playbackRate: 1 } }),
];
