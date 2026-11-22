# Content Engine

My motion graphics engine for **YouTube** (long-form and Shorts) and **Facebook** (feed and Reels). Every video is code, built with [Remotion](https://www.remotion.dev) (React → MP4). Write one JSON file and render the same video for every platform.

## What's inside

- **35 animation style templates** covering 66 of the 100 catalogued styles (44 directly, 22 by changing a template's settings):

  | Group | Templates |
  |---|---|
  | Typography | `KineticText`, `Typewriter`, `GlitchText`, `WordCaptions`, `TitleCard`, `QuoteCard`, `ScrambleText`, `MaskReveal`, `HighlightText`, `SplitFlap` |
  | Explainers | `LineDraw` (whiteboard / chalkboard / blueprint), `Flowchart`, `Timeline`, `ListReveal`, `Comparison`, `CodeBlock` |
  | Data | `BarChart`, `BarChartRace`, `LineChart`, `DonutChart`, `Pictogram`, `StatCounter` |
  | Social & branding | `SubscribeCTA`, `EndScreen`, `ChatStory`, `NotificationPop`, `NewsTicker`, `ChapterBar`, `TransitionsReel` |
  | Abstract & 3D | `Particles`, `LiquidBlob`, `Isometric`, `ThreeDHero`, `Globe` |
  | Audio | `AudioWave` (podcast audiogram that reacts to your voiceover) |

- **4 output formats** for every template: YouTube 16:9 (1920×1080), Shorts/Reels 9:16 (1080×1920), Facebook 1:1 (1080×1080) and Facebook feed 4:5 (1080×1350)
- **Bangla (বাংলা) support**: Hind Siliguri font loaded automatically, and per-letter effects never break conjuncts (যুক্তাক্ষর)
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

See [`content/videos/002-bangla-demo`](content/videos/002-bangla-demo/video.json) for a Bangla example.

### Audiogram with your own voice

Put your audio file in `public/` (e.g. `public/episode1.mp3`), then in `video.json` use the `AudioWave` template with `"audioSrc": "episode1.mp3"` and `"durationSeconds"` set to the audio length. `npm run demo-audio` regenerates the bundled `public/demo-beat.wav` test file.

## Project layout

```
src/
  brand/theme.ts        colors, fonts, channel name (change once, every template updates)
  brand/fonts.ts        Google Fonts loading (Poppins, Inter, Hind Siliguri for Bangla)
  formats.ts            platform sizes
  components/           shared pieces (Background, LowerThird)
  lib/                  helpers (responsive sizing, Bangla-safe text splitting)
  templates/            one file per animation style + registry.ts
  Root.tsx              registers every template × every format
content/videos/<slug>/  video.json, script.md, assets/ per video
public/                 audio/images your videos use (demo-beat.wav included)
scripts/                new-video, render and demo-audio CLIs
research/               style catalog and GitHub research
```

## Add a new style

1. Create `src/templates/MyStyle.tsx` exporting a component and a zod schema.
2. Add it to `TEMPLATES` in `src/templates/registry.ts`.
3. Mark it ✅ in `research/STYLE_CATALOG.md`.

## License note

Remotion is free for individuals and teams of up to 3 people, including commercial use. See the [Remotion license](https://www.remotion.dev/docs/license/faq).
