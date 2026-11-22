#!/usr/bin/env node
// Render a video project to every platform it targets.
//   npm run render -- <slug>            render content/videos/<slug>/video.json
//   npm run render -- <slug> short      only one format
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FORMAT_IDS = { youtube: "YouTube", short: "Short", fbSquare: "FB-Square", fbFeed: "FB-Feed" };

const [slug, onlyFormat] = process.argv.slice(2);
if (!slug) {
  console.error("Usage: npm run render -- <slug> [youtube|short|fbSquare|fbFeed]");
  process.exit(1);
}

const dir = join("content", "videos", slug);
const file = join(dir, "video.json");
if (!existsSync(file)) {
  console.error(`Not found: ${file}. Create one with: npm run new -- ${slug} <Template>`);
  process.exit(1);
}

const video = JSON.parse(readFileSync(file, "utf8"));
const formats = onlyFormat ? [onlyFormat] : video.formats ?? ["youtube"];
const outDir = join("out", slug);
mkdirSync(outDir, { recursive: true });
const propsFile = join(outDir, "props.json");
writeFileSync(propsFile, JSON.stringify(video.props ?? {}));

for (const f of formats) {
  const formatId = FORMAT_IDS[f];
  if (!formatId) {
    console.error(`Unknown format "${f}". Use one of: ${Object.keys(FORMAT_IDS).join(", ")}`);
    process.exit(1);
  }
  const comp = `${formatId}-${video.template}`;
  const out = join(outDir, `${slug}-${f}.mp4`);
  console.log(`\n▶ Rendering ${comp} → ${out}`);
  const r = spawnSync("npx", ["remotion", "render", comp, out, `--props=${propsFile}`], { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log(`\n✔ Done. Files in ${outDir}`);
