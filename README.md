# Content Engine

My motion graphics engine for **YouTube** (long-form and Shorts) and **Facebook** (feed and Reels). Every video is code, built with [Remotion](https://www.remotion.dev) (React → MP4). Write one JSON file and render the same video for every platform.

## What's inside

- **17 animation style templates**: kinetic typography, typewriter, glitch, word-by-word captions, quote cards, stat counters, bar charts, Top-N lists, versus split screens, timelines, whiteboard/chalkboard/blueprint line drawing, particles, liquid blobs, isometric blocks, 3D hero objects and a scene-transitions reel
- **4 output formats** for every template: YouTube 16:9 (1920×1080), Shorts/Reels 9:16 (1080×1920), Facebook 1:1 (1080×1080) and Facebook feed 4:5 (1080×1350)
- **[Style catalog](research/STYLE_CATALOG.md)**: 100 animation and motion graphics styles, what kind of video each fits, and whether the engine has it yet
- **[GitHub engines research](research/GITHUB_ENGINES.md)**: the open-source projects this builds on and what to add next
- **[Journey log](JOURNEY.md)**

## Quick start

```powershell
npm install
npm run dev          # opens Remotion Studio: preview and tweak every template live
```

## Make a video

```powershell
npm run new -- top-5-tools ListReveal youtube short fbFeed
# edit content/videos/top-5-tools/video.json ("props" overrides the template defaults)
npm run render -- top-5-tools          # renders every format into out/top-5-tools/
npm run render -- top-5-tools short    # or just one format
```

Or render a template straight from Studio. Composition IDs are `<Format>-<Template>`, for example `Short-GlitchText` or `FB-Feed-BarChart`.

## Project layout

```
src/
  brand/theme.ts        colors, fonts, channel name (change once, every template updates)
  formats.ts            platform sizes
  components/           shared pieces (Background, LowerThird)
  templates/            one file per animation style + registry.ts
  Root.tsx              registers every template × every format
content/videos/<slug>/  video.json, script.md, assets/ per video
scripts/                new-video and render CLIs
research/               style catalog and GitHub research
```

## Add a new style

1. Create `src/templates/MyStyle.tsx` exporting a component and a zod schema.
2. Add it to `TEMPLATES` in `src/templates/registry.ts`.
3. Mark it ✅ in `research/STYLE_CATALOG.md`.

## License note

Remotion is free for individuals and teams of up to 3 people, including commercial use. See the [Remotion license](https://www.remotion.dev/docs/license/faq).
