# Animation & Motion Graphics Style Catalog (100 styles)

Each style lists the video use case it fits best and how the engine covers it:

- **✅ `TemplateId`**: built and registered in Remotion Studio. Render it for any format (`YouTube-`, `Short-`, `FB-Square-`, `FB-Feed-`).
- **🔧 `TemplateId` + props**: covered by an existing template with different props or theme.
- **🗺️ planned**: not built yet. The "Tool" column names the library to build it with (already installed unless marked *external*).

Formats: YouTube 16:9 · Shorts/Reels 9:16 · Facebook 1:1 and 4:5.

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
| 8 | Split-flap / flip board | Countdowns, announcements | 🗺️ planned (CSS 3D) |
| 9 | Scramble / decode text | Mystery, hacking, reveals | 🗺️ planned (`random()` from remotion) |
| 10 | Mask-reveal text | Premium brand intros | 🗺️ planned (CSS `clip-path`) |
| 11 | Stroke-draw lettering | Handwritten titles | 🔧 `LineDraw` with letter paths |
| 12 | 3D extruded text | Gaming, trailers | 🗺️ planned (`@remotion/three` + drei `Text3D`) |
| 13 | Highlight / marker sweep | Educational emphasis | 🗺️ planned |
| 14 | Text on path | Playful, retro | 🗺️ planned (`@remotion/paths`) |
| 15 | Big number + label | Stats, facts | ✅ `StatCounter` |

## B. Explainer & educational (16–30)

| # | Style | Best for | Engine |
|---|---|---|---|
| 16 | Whiteboard / line drawing | Explainers, how-it-works | ✅ `LineDraw` |
| 17 | Flat 2D explainer | Product, concept explainers | 🔧 `ListReveal` + `Isometric` scenes |
| 18 | Diagram / flowchart build | Processes, systems | 🗺️ planned (`@remotion/paths` arrows) |
| 19 | Timeline | History, biographies, roadmaps | ✅ `Timeline` |
| 20 | Comparison / versus split | A vs B, before/after | ✅ `Comparison` |
| 21 | Top-N listicle reveal | "Top 5 ...", rankings | ✅ `ListReveal` |
| 22 | Step-by-step tutorial cards | How-to guides | 🔧 `ListReveal` (numbered) |
| 23 | Math / equation animation | STEM teaching | 🗺️ *external*: Manim or Motion Canvas |
| 24 | Code walkthrough | Programming channels | 🗺️ planned (Shiki highlighting + `Typewriter`) |
| 25 | Map route animation | Travel, geography, history | 🗺️ planned (SVG maps + `@remotion/paths`) |
| 26 | Icon-driven explainer | Social posts, quick facts | 🔧 `ListReveal` with emoji/icons |
| 27 | Character explainer (2D rig) | Storytelling | 🗺️ planned (Lottie/Rive characters) |
| 28 | Paper cut-out / collage | Craft, kids, storytelling | 🗺️ planned |
| 29 | Chalkboard | Education, nostalgic | 🔧 `LineDraw` + chalk theme |
| 30 | Blueprint / technical drawing | Engineering, architecture | 🔧 `LineDraw` + blue theme |

## C. Data & infographics (31–42)

| # | Style | Best for | Engine |
|---|---|---|---|
| 31 | Animated bar chart | Comparisons, rankings | ✅ `BarChart` |
| 32 | Bar chart race | "Most popular X over time" | 🗺️ planned (extend `BarChart` with keyframes) |
| 33 | Counting numbers | Milestones, statistics | ✅ `StatCounter` |
| 34 | Line chart draw | Trends, prices, growth | 🗺️ planned (`@remotion/paths`) |
| 35 | Pie / donut fill | Shares, percentages | 🗺️ planned (`@remotion/shapes` `makePie`) |
| 36 | Progress bars / meters | Goals, ratings | 🔧 `BarChart` single bar |
| 37 | Pictogram / icon arrays | Population, "1 in 10" | 🗺️ planned |
| 38 | Map heatmap | Country stats | 🗺️ planned |
| 39 | Animated table / leaderboard | Rankings, sports | 🔧 `ListReveal` |
| 40 | Dashboard / KPI tiles | Business, finance updates | 🔧 `StatCounter` grid |
| 41 | Scrolling news ticker | News, updates | 🗺️ planned |
| 42 | Data-driven video from JSON/CSV | Weekly recap series | ✅ every template (`content/videos/*/video.json`) |

## D. Shape, geometry & abstract (43–58)

| # | Style | Best for | Engine |
|---|---|---|---|
| 43 | Geometric shape animation | Intros, transitions | 🔧 `Isometric` / `@remotion/shapes` |
| 44 | Liquid / blob motion | Lifestyle, beauty, music | ✅ `LiquidBlob` |
| 45 | Particle systems | Tech, sci-fi, ambient | ✅ `Particles` |
| 46 | Isometric 3D-in-2D | Tech, business, process | ✅ `Isometric` |
| 47 | Gradient mesh / aurora backgrounds | Every background | ✅ `Background` component |
| 48 | Morphing shapes | Logo stings, transitions | 🗺️ planned (flubber, *external*) |
| 49 | Line art / minimal strokes | Premium, minimal brands | 🔧 `LineDraw` |
| 50 | Grid / Bauhaus / Swiss | Design, art channels | 🗺️ planned |
| 51 | Op-art / looping illusion | Satisfying loops | 🗺️ planned |
| 52 | Noise / generative art | Ambient, music visuals | 🗺️ planned (`@remotion/noise`, add later) |
| 53 | Audio visualizer / waveform | Podcasts, music | 🗺️ planned (`@remotion/media-utils` installed) |
| 54 | Neon / synthwave | Retro, gaming, music | 🔧 `GlitchText` + neon theme |
| 55 | Glassmorphism UI | Tech, apps | 🔧 `Comparison`/`QuoteCard` glass cards |
| 56 | Neumorphism | Product UI demos | 🗺️ planned |
| 57 | Duotone | Posters, editorial | 🗺️ planned (CSS filters) |
| 58 | Halftone / risograph | Retro editorial | 🗺️ planned |

## E. 3D & depth (59–68)

| # | Style | Best for | Engine |
|---|---|---|---|
| 59 | 3D hero object | Product shots, intros | ✅ `ThreeDHero` |
| 60 | Low-poly 3D | Gaming, geography | 🔧 `ThreeDHero` (flat shading) |
| 61 | 2.5D parallax photo | Documentaries, history | 🗺️ planned (layered images) |
| 62 | Camera fly-through | Architecture, worlds | 🗺️ planned (`@remotion/three` camera) |
| 63 | 3D device mockup | App/website showcases | 🗺️ planned (GLTF models) |
| 64 | Claymation look | Kids, playful | 🗺️ planned (3D + soft lighting) |
| 65 | 3D globe | News, travel, geopolitics | 🗺️ planned (three.js sphere + texture) |
| 66 | Voxel | Gaming, Minecraft-adjacent | 🗺️ planned |
| 67 | Abstract 3D loops | Satisfying, ambient | 🔧 `ThreeDHero` |
| 68 | Exploded view | Tech, products | 🗺️ planned |

## F. Transitions & editing (69–80)

| # | Style | Best for | Engine |
|---|---|---|---|
| 69 | Fade / crossfade | Everything | ✅ `TransitionsReel` |
| 70 | Slide / push | Lists, scene changes | ✅ `TransitionsReel` |
| 71 | Wipe | Before/after, chapters | ✅ `TransitionsReel` |
| 72 | Flip | Reveals | ✅ `TransitionsReel` |
| 73 | Clock wipe | Retro, timing themes | ✅ `TransitionsReel` |
| 74 | Zoom punch-in | Talking-head energy | 🗺️ planned |
| 75 | Whip pan / motion blur | Vlogs, travel | 🗺️ planned (`@remotion/motion-blur`, add later) |
| 76 | Shape / logo mask transition | Branded channels | 🗺️ planned |
| 77 | Glitch transition | Tech, gaming | 🔧 `GlitchText` |
| 78 | Ink / paint splash | Art, lifestyle | 🗺️ planned (Lottie) |
| 79 | Light leak / film burn | Cinematic vlogs | 🗺️ planned (overlay video assets) |
| 80 | Match cut | Storytelling | manual (edit with your footage) |

## G. Social, branding & UI (81–92)

| # | Style | Best for | Engine |
|---|---|---|---|
| 81 | Logo sting / reveal | Channel branding | 🔧 `TitleCard` |
| 82 | Subscribe / like CTA | End of every YouTube video | 🗺️ planned |
| 83 | End screen | YouTube end cards | 🗺️ planned |
| 84 | Social comment / tweet card | Reactions, commentary | 🔧 `QuoteCard` |
| 85 | Chat / messaging animation | Stories, drama, skits | 🗺️ planned |
| 86 | Phone UI / app mockup | Tech reviews | 🗺️ planned |
| 87 | Notification pop-ups | Hooks, attention | 🗺️ planned |
| 88 | Progress / chapter bar | Long videos | 🗺️ planned |
| 89 | Countdown | Launches, Top-N | 🔧 `StatCounter` (counting down) |
| 90 | Split-screen reaction | Reaction videos | 🔧 `Comparison` |
| 91 | Meme / caption overlay | Comedy shorts | 🔧 `WordCaptions` |
| 92 | Podcast audiogram | Podcast clips | 🗺️ planned (`@remotion/media-utils`) |

## H. Illustration & traditional looks (93–100)

| # | Style | Best for | Engine |
|---|---|---|---|
| 93 | Lottie animations | Icons, characters, micro-interactions | 🗺️ planned (`@remotion/lottie` installed) |
| 94 | Rive state-machine characters | Interactive mascots | 🗺️ planned (`@remotion/rive`, add later) |
| 95 | Frame-by-frame (cel) | Premium storytelling | *external*: draw in Krita/OpenToonz, import PNG sequence |
| 96 | Rotoscope | Music videos | *external* |
| 97 | Cut-out puppet (Moho/Duik style) | Story channels | *external*: export to Lottie, play via #93 |
| 98 | Pixel art | Gaming, retro | 🗺️ planned (`imageRendering: pixelated`) |
| 99 | Stop-motion look | Crafts, kids | 🗺️ planned (step easing on any template) |
| 100 | Hand-drawn / sketchy (Rough.js) | Casual explainers | 🗺️ planned (roughjs, add later) |

## Choosing a style by video case

| Video case | Start with |
|---|---|
| YouTube Short / Reel hook | `KineticText` → `WordCaptions` |
| Explainer / education | `LineDraw`, `Timeline`, `ListReveal`, `BarChart` |
| News / facts | `StatCounter`, `BarChart`, `Typewriter` |
| Motivation / quotes | `QuoteCard`, `KineticText`, `LiquidBlob` background |
| Tech / gaming | `GlitchText`, `Particles`, `ThreeDHero`, `Isometric` |
| Comparison / review | `Comparison`, `BarChart` |
| Channel branding | `TitleCard`, `LowerThird`, `TransitionsReel` |
