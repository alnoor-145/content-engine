#!/usr/bin/env node
// Scaffold a new video project.
//   npm run new -- <slug> <Template> [formats...]
//   npm run new -- top-5-tools ListReveal youtube short fbFeed
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [slug, template, ...formats] = process.argv.slice(2);
if (!slug || !template) {
  console.error("Usage: npm run new -- <slug> <Template> [youtube short fbReel fbSquare fbFeed]");
  console.error("Templates: see src/templates/registry.ts or research/STYLE_CATALOG.md");
  process.exit(1);
}

const dir = join("content", "videos", slug);
if (existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}
mkdirSync(join(dir, "assets"), { recursive: true });

writeFileSync(
  join(dir, "video.json"),
  JSON.stringify(
    {
      title: slug.replace(/-/g, " "),
      template,
      formats: formats.length ? formats : ["youtube", "short", "fbReel"],
      // Any prop you leave out falls back to the template's defaults.
      props: {},
      publish: { youtube: { title: "", description: "", tags: [] }, facebook: { caption: "" } },
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(dir, "script.md"), `# ${slug}\n\n## Hook\n\n## Body\n\n## Call to action\n`);
console.log(`✔ Created ${dir}. Edit video.json, preview with "npm run dev", render with "npm run render -- ${slug}"`);
