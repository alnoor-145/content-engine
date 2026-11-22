# Content Engine

**Channels:** YouTube [Mr N Boy (@SubscribeYt_1)](https://www.youtube.com/@SubscribeYt_1) · Facebook [Al NUR](https://www.facebook.com/share/1HYnZ8SaYY/)

My motion graphics engine for **YouTube** (long-form and Shorts) and **Facebook** (feed and Reels). Every video is code, built with [Remotion](https://www.remotion.dev) (React → MP4). Write one JSON file and render the same video for every platform.

## What's inside

- **70 animation templates** covering 96 of the 100 catalogued styles (73 directly, 23 by changing a template's settings), plus extra 3D, 2D, map and story scenes:

  | Group | Templates |
  |---|---|
  | Typography | `KineticText`, `Typewriter`, `GlitchText`, `WordCaptions`, `TitleCard`, `QuoteCard`, `ScrambleText`, `MaskReveal`, `HighlightText`, `SplitFlap`, `ExtrudedText`, `TextOnPath` |
  | Explainers | `LineDraw` (whiteboard / chalkboard / blueprint), `RoughSketch` (hand-drawn), `Flowchart`, `Timeline`, `ListReveal`, `Comparison`, `CodeBlock`, `Equation` (LaTeX math) |
  | Cartoon stories | `StoryScene`: talking characters with lip-sync to your voice, Bangla karaoke subtitles, walking, gestures, emotions, camera follows the speaker, village / river / road / field / night scenes with boats, birds, cars, rain, fireflies, scene transitions and auto-ducking music |
  | Maps & places | `MapSearch` (maps-app search → fly → route with time & distance), `CountryProfile` (globe → country + stats), `CountryCompare` (true-size comparison), `EarthZoom` (space → country → village → house), `ZoomChain` (zoom through your own pictures), `MapRoute`, `MapHeatmap`, `Globe` |
  | Data | `BarChart`, `BarChartRace`, `LineChart`, `DonutChart`, `Pictogram`, `StatCounter` |
  | Social & branding | `SubscribeCTA`, `EndScreen`, `ChatStory`, `NotificationPop`, `NewsTicker`, `ChapterBar`, `DeviceMockup`, `SoftUI` |
  | Transitions | `TransitionsReel` (fade, slide, wipe, flip, clock), `TransitionsReel2` (iris/star mask, whip pan, ink splash, light leak) |
  | Abstract & shapes | `Particles`, `LiquidBlob`, `Isometric`, `MorphShapes`, `Patterns` (Bauhaus, op-art, generative) |
  | 3D | `Text3D` (real extruded 3D letters), `ThreeDHero`, `SolarSystem`, `DNAHelix`, `Tunnel3D` (wormhole), `Bars3D`, `CardCarousel`, `VoxelWorld` (fly-through), `ExplodedView`, `ClayScene` (claymation / stop-motion) |
  | 2D scenes | `Mascot` (talking cartoon narrator), `Celebration` (confetti / fireworks), `EidGreeting` (moon, lanterns, Bangla greeting), `CityNight` (day → night city), `Countdown` |
  | Illustration & photo | `PaperCutout`, `PixelArt`, `LottieScene`, `PhotoFX` (Ken Burns, punch-in, duotone, halftone, 2.5D parallax) |
  | Audio | `AudioWave` (podcast audiogram that reacts to your voiceover) |

- **5 output formats** for every template: YouTube 16:9 (1920×1080), YouTube Shorts 9:16, Facebook Reels 9:16 (1080×1920), Facebook 1:1 (1080×1080) and Facebook feed 4:5 (1080×1350)
- **Automatic channel branding**: YouTube formats show **Mr N Boy** ([@SubscribeYt_1](https://www.youtube.com/@SubscribeYt_1)) with a red *Subscribe* button; Facebook formats show **Al NUR** ([Facebook page](https://www.facebook.com/share/1HYnZ8SaYY/)) with a blue *Follow* button. Edit `BRANDS` in `src/brand/theme.ts` to change them.
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
npm run new -- top-5-tools ListReveal youtube short fbReel fbFeed
# edit content/videos/top-5-tools/video.json ("props" overrides the template defaults)
npm run render -- top-5-tools          # renders every format into out/top-5-tools/
npm run render -- top-5-tools short    # or just one format
```

Or render a template straight from Studio. Composition IDs are `<Format>-<Template>`, for example `Short-GlitchText`, `FB-Reel-SubscribeCTA` or `FB-Feed-BarChart`.

See [`content/videos/002-bangla-demo`](content/videos/002-bangla-demo/video.json) for a Bangla example.

### Cartoon story with your own voice

See [`content/videos/003-story-demo/script.md`](content/videos/003-story-demo/script.md) (in Bangla): record your voice, write an SRT with `Name: text` lines, set `voiceSrc` and `srtSrc`, arrange scenes, render.

### Your own photos and Lottie animations

- `PhotoFX`: put an image in `public/` and set `"src": "my-photo.jpg"` and `"mode"` (`kenburns`, `punchin`, `duotone`, `halftone` or `parallax`).
- `LottieScene`: download a free animation `.json` from LottieFiles (or export from After Effects with Bodymovin), put it in `public/` and set `"src": "my-animation.json"`.
- `MapRoute` / `MapHeatmap`: country names follow Natural Earth (e.g. `"Bangladesh"`, `"United States of America"`).

### Audiogram with your own voice

Put your audio file in `public/` (e.g. `public/episode1.mp3`), then in `video.json` use the `AudioWave` template with `"audioSrc": "episode1.mp3"` and `"durationSeconds"` set to the audio length. `npm run demo-audio` regenerates the bundled `public/demo-beat.wav` test file.

## Project layout

```
src/
  brand/theme.ts        colors, fonts, channel name (change once, every template updates)
  brand/fonts.ts        Google Fonts loading (Poppins, Inter, Hind Siliguri for Bangla)
  formats.ts            platform sizes
  components/           shared pieces (Background, LowerThird)
  lib/                  helpers (responsive sizing, Bangla-safe text, world map data)
  templates/            one file per animation style + registry.ts
  story/                cartoon engine: character rig, lip-sync, nature kit, backgrounds, demo story
  transitions/          custom scene transitions (iris, whip pan, ink splash, light leak)
  assets/               bundled demo data (Lottie demo)
  Root.tsx              registers every template × every format
content/videos/<slug>/  video.json, script.md, assets/ per video
public/                 audio/images your videos use (demo-beat.wav, demo-photo.jpg, fonts/ for 3D text)
scripts/                new-video, render and demo-audio CLIs
research/               style catalog and GitHub research
```

## Add a new style

1. Create `src/templates/MyStyle.tsx` exporting a component and a zod schema.
2. Add it to `TEMPLATES` in `src/templates/registry.ts`.
3. Mark it ✅ in `research/STYLE_CATALOG.md`.

## License note

Remotion is free for individuals and teams of up to 3 people, including commercial use. See the [Remotion license](https://www.remotion.dev/docs/license/faq).
