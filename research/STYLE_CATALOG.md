# Animation & Motion Graphics Style Catalog (100 styles)

Each style lists the video use case it fits best and how the engine covers it:

- **✅ `TemplateId`**: built and registered in Remotion Studio. Render it for any format (`YouTube-`, `Short-`, `FB-Square-`, `FB-Feed-`).
- **🔧 `TemplateId` + props**: covered by an existing template with different props or theme.
- **🗺️ planned**: not built yet.
- ***external* / manual**: made outside code (drawing software or your own footage), then brought into a video.

Formats: YouTube 16:9 · Shorts/Reels 9:16 · Facebook 1:1 and 4:5.

**Coverage: 96 of 100 styles** (73 ✅ built, 23 🔧 by settings). Not covered by code: #80 match cut (edit your own footage), #94 Rive (needs a `.riv` file from the Rive editor), #95 frame-by-frame and #96 rotoscope (drawn by hand in Krita/OpenToonz).

## A. Typography (1–15)

| # | Style | Best for | Engine |
|---|---|---|---|
| 1 | Kinetic typography | Hooks, quotes, motivational shorts | ✅ `KineticText` |
| 2 | Typewriter / terminal text | Tech, coding, "did you know" | ✅ `Typewriter` |
| 3 | Glitch text | Tech news, gaming, edgy intros | ✅ `GlitchText` |
| 4 | Word-by-word captions (TikTok style) | Every Short/Reel, talking-head | ✅ `WordCaptions` |
| 5 | Title card / bold intro | Episode intros, thumbnails in motion | ✅ `TitleCard` |
| 6 | Quote card | Quotes, testimonials, wisdom posts | ✅ `QuoteCard` |
| 7 | Lower third | Name, handle, source credit | ✅ `LowerThird` component |
| 8 | Split-flap / flip board | Countdowns, announcements | ✅ `SplitFlap` |
| 9 | Scramble / decode text | Mystery, hacking, reveals | ✅ `ScrambleText` |
| 10 | Mask-reveal text | Premium brand intros | ✅ `MaskReveal` |
| 11 | Stroke-draw lettering | Handwritten titles | 🔧 `LineDraw` with letter paths |
| 12 | 3D extruded text | Gaming, trailers | ✅ `ExtrudedText` |
| 13 | Highlight / marker sweep | Educational emphasis | ✅ `HighlightText` |
| 14 | Text on path | Playful, retro, badges | ✅ `TextOnPath` (`circle` or `wave`) |
| 15 | Big number + label | Stats, facts | ✅ `StatCounter` |

## B. Explainer & educational (16–30)

| # | Style | Best for | Engine |
|---|---|---|---|
| 16 | Whiteboard / line drawing | Explainers, how-it-works | ✅ `LineDraw` |
| 17 | Flat 2D explainer | Product, concept explainers | 🔧 `ListReveal` + `Isometric` scenes |
| 18 | Diagram / flowchart build | Processes, systems | ✅ `Flowchart` |
| 19 | Timeline | History, biographies, roadmaps | ✅ `Timeline` |
| 20 | Comparison / versus split | A vs B, before/after | ✅ `Comparison` |
| 21 | Top-N listicle reveal | "Top 5 ...", rankings | ✅ `ListReveal` |
| 22 | Step-by-step tutorial cards | How-to guides | 🔧 `ListReveal` (numbered) |
| 23 | Math / equation animation | STEM teaching | ✅ `Equation` (LaTeX via KaTeX; Manim for advanced math) |
| 24 | Code walkthrough | Programming channels | ✅ `CodeBlock` |
| 25 | Map route animation | Travel, geography, history | ✅ `MapRoute` |
| 26 | Icon-driven explainer | Social posts, quick facts | 🔧 `ListReveal` with emoji/icons |
| 27 | Character explainer (2D rig) | Storytelling | 🔧 `LottieScene` with a character `.json` |
| 28 | Paper cut-out / collage | Craft, kids, storytelling | ✅ `PaperCutout` |
| 29 | Chalkboard | Education, nostalgic | 🔧 `LineDraw` (`paper: "chalkboard"`) |
| 30 | Blueprint / technical drawing | Engineering, architecture | 🔧 `LineDraw` (`paper: "blueprint"`) |

## C. Data & infographics (31–42)

| # | Style | Best for | Engine |
|---|---|---|---|
| 31 | Animated bar chart | Comparisons, rankings | ✅ `BarChart` |
| 32 | Bar chart race | "Most popular X over time" | ✅ `BarChartRace` |
| 33 | Counting numbers | Milestones, statistics | ✅ `StatCounter` |
| 34 | Line chart draw | Trends, prices, growth | ✅ `LineChart` |
| 35 | Pie / donut fill | Shares, percentages | ✅ `DonutChart` |
| 36 | Progress bars / meters | Goals, ratings | 🔧 `BarChart` single bar / `SoftUI` dial |
| 37 | Pictogram / icon arrays | Population, "1 in 10" | ✅ `Pictogram` |
| 38 | Map heatmap | Country stats | ✅ `MapHeatmap` |
| 39 | Animated table / leaderboard | Rankings, sports | 🔧 `ListReveal` |
| 40 | Dashboard / KPI tiles | Business, finance updates | 🔧 `StatCounter` grid |
| 41 | Scrolling news ticker | News, updates | ✅ `NewsTicker` |
| 42 | Data-driven video from JSON/CSV | Weekly recap series | ✅ every template (`content/videos/*/video.json`) |

## D. Shape, geometry & abstract (43–58)

| # | Style | Best for | Engine |
|---|---|---|---|
| 43 | Geometric shape animation | Intros, transitions | 🔧 `MorphShapes` / `Isometric` |
| 44 | Liquid / blob motion | Lifestyle, beauty, music | ✅ `LiquidBlob` |
| 45 | Particle systems | Tech, sci-fi, ambient | ✅ `Particles` |
| 46 | Isometric 3D-in-2D | Tech, business, process | ✅ `Isometric` |
| 47 | Gradient mesh / aurora backgrounds | Every background | ✅ `Background` component |
| 48 | Morphing shapes | Logo stings, transitions | ✅ `MorphShapes` |
| 49 | Line art / minimal strokes | Premium, minimal brands | 🔧 `LineDraw` |
| 50 | Grid / Bauhaus / Swiss | Design, art channels | ✅ `Patterns` (`mode: "bauhaus"`) |
| 51 | Op-art / looping illusion | Satisfying loops | ✅ `Patterns` (`mode: "opart"`) |
| 52 | Noise / generative art | Ambient, music visuals | ✅ `Patterns` (`mode: "generative"`) |
| 53 | Audio visualizer / waveform | Podcasts, music | ✅ `AudioWave` |
| 54 | Neon / synthwave | Retro, gaming, music | 🔧 `GlitchText` + neon theme |
| 55 | Glassmorphism UI | Tech, apps | 🔧 `Comparison`/`QuoteCard` glass cards |
| 56 | Neumorphism | Product UI demos | ✅ `SoftUI` |
| 57 | Duotone | Posters, editorial | ✅ `PhotoFX` (`mode: "duotone"`) |
| 58 | Halftone / risograph | Retro editorial | ✅ `PhotoFX` (`mode: "halftone"`) |

## E. 3D & depth (59–68)

| # | Style | Best for | Engine |
|---|---|---|---|
| 59 | 3D hero object | Product shots, intros | ✅ `ThreeDHero` |
| 60 | Low-poly 3D | Gaming, geography | 🔧 `ThreeDHero` (flat shading) |
| 61 | 2.5D parallax photo | Documentaries, history | ✅ `PhotoFX` (`mode: "parallax"`) |
| 62 | Camera fly-through | Architecture, worlds | ✅ `VoxelWorld` |
| 63 | 3D device mockup | App/website showcases | ✅ `DeviceMockup` |
| 64 | Claymation look | Kids, playful | ✅ `ClayScene` |
| 65 | 3D globe | News, travel, geopolitics | ✅ `Globe` |
| 66 | Voxel | Gaming, Minecraft-adjacent | ✅ `VoxelWorld` |
| 67 | Abstract 3D loops | Satisfying, ambient | 🔧 `ThreeDHero` |
| 68 | Exploded view | Tech, products | ✅ `ExplodedView` |

## F. Transitions & editing (69–80)

| # | Style | Best for | Engine |
|---|---|---|---|
| 69 | Fade / crossfade | Everything | ✅ `TransitionsReel` |
| 70 | Slide / push | Lists, scene changes | ✅ `TransitionsReel` |
| 71 | Wipe | Before/after, chapters | ✅ `TransitionsReel` |
| 72 | Flip | Reveals | ✅ `TransitionsReel` |
| 73 | Clock wipe | Retro, timing themes | ✅ `TransitionsReel` |
| 74 | Zoom punch-in | Talking-head energy | ✅ `PhotoFX` (`mode: "punchin"`) |
| 75 | Whip pan / motion blur | Vlogs, travel | ✅ `TransitionsReel2` (`whipPan`) |
| 76 | Shape / logo mask transition | Branded channels | ✅ `TransitionsReel2` (`iris` circle/star/diamond) |
| 77 | Glitch transition | Tech, gaming | 🔧 `GlitchText` |
| 78 | Ink / paint splash | Art, lifestyle | ✅ `TransitionsReel2` (`inkSplash`) |
| 79 | Light leak / film burn | Cinematic vlogs | ✅ `TransitionsReel2` (`lightLeak`) |
| 80 | Match cut | Storytelling | manual (edit with your footage) |

All of #75–79 are reusable presentations in `src/transitions/custom.tsx`.

## G. Social, branding & UI (81–92)

| # | Style | Best for | Engine |
|---|---|---|---|
| 81 | Logo sting / reveal | Channel branding | 🔧 `TitleCard` / `MorphShapes` |
| 82 | Subscribe / like CTA | End of every YouTube video | ✅ `SubscribeCTA` |
| 83 | End screen | YouTube end cards | ✅ `EndScreen` |
| 84 | Social comment / tweet card | Reactions, commentary | 🔧 `QuoteCard` |
| 85 | Chat / messaging animation | Stories, drama, skits | ✅ `ChatStory` |
| 86 | Phone UI / app mockup | Tech reviews | ✅ `DeviceMockup` (also `ChatStory`) |
| 87 | Notification pop-ups | Hooks, attention | ✅ `NotificationPop` |
| 88 | Progress / chapter bar | Long videos | ✅ `ChapterBar` |
| 89 | Countdown | Launches, Top-N | 🔧 `StatCounter` (counting down) |
| 90 | Split-screen reaction | Reaction videos | 🔧 `Comparison` |
| 91 | Meme / caption overlay | Comedy shorts | 🔧 `WordCaptions` |
| 92 | Podcast audiogram | Podcast clips | ✅ `AudioWave` (point `audioSrc` at your voiceover) |

## H. Illustration & traditional looks (93–100)

| # | Style | Best for | Engine |
|---|---|---|---|
| 93 | Lottie animations | Icons, characters, micro-interactions | ✅ `LottieScene` |
| 94 | Rive state-machine characters | Interactive mascots | 🗺️ planned (needs a `.riv` file; add `@remotion/rive`) |
| 95 | Frame-by-frame (cel) | Premium storytelling | *external*: draw in Krita/OpenToonz, import PNG sequence |
| 96 | Rotoscope | Music videos | *external* |
| 97 | Cut-out puppet (Moho/Duik style) | Story channels | 🔧 export the rig to Lottie, play in `LottieScene` |
| 98 | Pixel art | Gaming, retro | ✅ `PixelArt` |
| 99 | Stop-motion look | Crafts, kids | ✅ `ClayScene` (`stepFrames: 2`) |
| 100 | Hand-drawn / sketchy (Rough.js) | Casual explainers | ✅ `RoughSketch` |

## Extra scenes (beyond the 100)

| Template | Type | Best for |
|---|---|---|
| `Text3D` | 3D | Channel logo / title in real extruded 3D letters (Latin text) |
| `SolarSystem` | 3D | Space, astronomy, science |
| `DNAHelix` | 3D | Biology, health, science |
| `Tunnel3D` | 3D | Sci-fi, gaming, high-energy intros |
| `Bars3D` | 3D | Data with a premium 3D look |
| `CardCarousel` | 3D | Top-N lists, tips, product lineups (works in Bangla) |
| `Mascot` | 2D | Talking cartoon narrator ("Sprout"), kids & explainers |
| `Celebration` | 2D | Milestones, giveaways, results (confetti or fireworks) |
| `EidGreeting` | 2D | Eid / Ramadan / festival greetings in Bangla |
| `CityNight` | 2D | Calm intros, vlogs, "a day in the life" |
| `Countdown` | 2D | Premieres, live streams, launches |
| `StoryScene` | 2D story | Bangla cartoon stories: lip-sync to voice, karaoke subtitles, walking, gestures, emotions, nature scenes, camera moves, transitions |
| `MapSearch` | Map | Travel, "how far is X", directions explainers |
| `CountryProfile` | Map | Country facts, geography, news |
| `CountryCompare` | Map | "How big is X really?", true-size comparisons |
| `EarthZoom` | Map | "Where is my village?", space-to-house dives |
| `ZoomChain` | Photo | Zoom through your own maps/photos step by step |
| `CharacterGallery` | 2D | "Meet the cast" — 16 original characters (people, robot, animals) |
| `MapTour` | Map | Trips, history routes, "a day in…" travel stories |
| `MapArcs` | Map | Remittances, flights, viewers/fans around the world |
| `StormTrack` | Map | Cyclone / storm news explainers (use official track data) |
| `CountryHighlight` | Map | Country groups and lists (SAARC, borders, top-N countries) |

## Choosing a style by video case

| Video case | Start with |
|---|---|
| YouTube Short / Reel hook | `NotificationPop`, `KineticText`, `ScrambleText`, `ExtrudedText` → `WordCaptions` |
| Story / drama / skit | `ChatStory`, `PaperCutout`, `ClayScene`, `LottieScene` |
| Explainer / education | `RoughSketch`, `LineDraw`, `Flowchart`, `HighlightText`, `Timeline`, `ListReveal` |
| Math / science | `Equation`, `LineChart`, `ExplodedView` |
| News / facts | `NewsTicker`, `MapHeatmap`, `Globe`, `StatCounter`, `Pictogram` |
| History / travel / geography | `MapRoute`, `MapHeatmap`, `Timeline`, `PhotoFX` (parallax, Ken Burns) |
| Data / statistics | `BarChartRace`, `LineChart`, `DonutChart`, `BarChart`, `Pictogram` |
| Motivation / quotes | `QuoteCard`, `HighlightText`, `KineticText`, `LiquidBlob`, `PhotoFX` (duotone) |
| Tech / gaming / coding | `CodeBlock`, `DeviceMockup`, `GlitchText`, `PixelArt`, `VoxelWorld`, `ThreeDHero` |
| App / product review | `DeviceMockup`, `ExplodedView`, `SoftUI`, `Comparison` |
| Podcast / music clips | `AudioWave`, `Patterns` (generative / op-art) |
| Comparison / review | `Comparison`, `BarChart`, `DonutChart` |
| Long videos | `ChapterBar` between sections, `TransitionsReel2` between scenes, `EndScreen` at the end |
| Science / space | `SolarSystem`, `DNAHelix`, `Equation`, `ExplodedView` |
| Festivals / milestones | `EidGreeting`, `Celebration`, `Countdown` |
| Kids / storytelling | `StoryScene`, `Mascot`, `PaperCutout`, `ClayScene`, `CityNight` |
| Geography / travel / "where is it" | `MapSearch`, `EarthZoom`, `CountryProfile`, `CountryCompare`, `ZoomChain` |
| Channel branding | `TitleCard`, `MorphShapes`, `TextOnPath`, `MaskReveal`, `SplitFlap`, `SubscribeCTA` |

## Bangla (বাংলা) support

Every template renders Bangla text with the **Hind Siliguri** font, loaded automatically. Per-character effects (`Typewriter`, `ScrambleText`, `SplitFlap`) split text by grapheme, so conjuncts like ক্ষ, স্ত্র and ন্ট stay intact. Mixed Bangla + English text works too. Display fonts that have no Bangla glyphs (Caveat in `RoughSketch`, Press Start 2P in `PixelArt`) fall back to Hind Siliguri for Bangla characters.
