# Open-source motion graphics engines on GitHub

Research notes from November 2026. These are the projects this engine builds on or could add later. Star counts move fast, so check each repo for current numbers.

## Core: video-as-code frameworks

| Project | Repo | Language | Why it matters | Used here |
|---|---|---|---|---|
| **Remotion** | `remotion-dev/remotion` | React / TS | Videos as React components. Renders MP4 locally. Has a big package ecosystem (transitions, three, lottie, captions, paths, shapes). | **Yes, the core engine** |
| Motion Canvas | `motion-canvas/motion-canvas` | TS | MIT. Generator-based timeline and an editor. Great for technical explainers. | Optional, for math/diagram-heavy videos |
| Revideo | `redotvideo/revideo` | TS | MIT fork of Motion Canvas with headless rendering via API | Optional |
| Manim Community | `ManimCommunity/manim` | Python | The 3Blue1Brown-style math animation engine | Optional (*external*, Python) |
| Theatre.js | `theatre-js/theatre` | TS | Visual keyframe editor for web and three.js | Later, to keyframe 3D scenes visually |

**License note:** Remotion is *source-available*, not OSI open source. It's free for individuals and companies of up to 3 people, including commercial use. Bigger teams need a Company License. As a solo creator you're covered. See the [Remotion license FAQ](https://www.remotion.dev/docs/license/faq).

## Animation libraries

| Project | Repo | Use |
|---|---|---|
| Lottie (web) | `airbnb/lottie-web` | Play After Effects animations exported as JSON. Wrapped by `@remotion/lottie` (installed) |
| Rive | `rive-app/rive-wasm` | State-machine characters. `@remotion/rive` wraps it |
| GSAP | `greensock/GSAP` | Web timeline animation. Free since 2024 |
| anime.js | `juliangarnier/anime` | Lightweight JS animation |
| Motion (Framer Motion) | `motiondivision/motion` | React UI animation |
| mo.js | `mojs/mojs` | Bursts and shape effects |
| three.js / React Three Fiber | `mrdoob/three.js`, `pmndrs/react-three-fiber` | 3D. Wrapped by `@remotion/three` (installed) |
| Rough.js | `rough-stuff/rough` | Hand-drawn sketch look. **Used in `RoughSketch`** |
| flubber | `veltman/flubber` | Shape morphing (not needed: `@remotion/paths` `interpolatePath` covers it in `MorphShapes`) |
| KaTeX | `KaTeX/KaTeX` | Fast LaTeX math rendering. **Used in `Equation`** |
| d3-geo + topojson + world-atlas | `d3/d3-geo`, `topojson/world-atlas` | Map projections and Natural Earth country shapes (public domain). **Used in `MapRoute`, `MapHeatmap`** |
| @remotion/noise | `remotion-dev/remotion` | Perlin/simplex noise. **Used in `Patterns`, `PaperCutout`, `VoxelWorld`** |
| opentype.js | `opentypejs/opentype.js` | Reads font files into letter outlines. **Used in `Text3D`** (with Poppins, OFL licence, in `public/fonts/`) |

## Templates and examples to learn from

- [Remotion resources list](https://www.remotion.dev/docs/resources): official index of templates, libraries and showcase projects
- [Remotion templates](https://www.remotion.dev/templates): official starters (Hello World, Three, TikTok captions, audiogram, and more)
- `reactvideoeditor/remotion-templates`: a community collection of free Remotion templates organized by category
- `remotion-dev/github-unwrapped`: a full production data-driven video project
- [GitHub topic: remotion](https://github.com/topics/remotion) and [motion-graphics](https://github.com/topics/motion-graphics)

## Desktop tools (outside this repo)

Blender (3D), Natron (compositing), OpenToonz and Krita (frame-by-frame), Inkscape (SVG assets you can animate with `LineDraw`), Glaxnimate (Lottie authoring).

## Sources

- https://www.remotion.dev/docs/license/faq
- https://www.remotion.dev/docs/transitions
- https://www.remotion.dev/docs/three
- https://www.remotion.dev/docs/lottie
- https://www.remotion.dev/docs/resources
- https://autoae.online/blog/open-source-remotion-alternatives-2026
- https://www.libhunt.com/topic/animation
- https://www.storyblocks.com/resources/tutorials/types-of-motion-graphics
- https://www.b2w.tv/blog/types-of-motion-graphics
