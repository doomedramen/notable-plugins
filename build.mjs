#!/usr/bin/env node
// Type-checks and bundles every plugins/<id>/src/main.ts into
// plugins/<id>/main.js, the entry file referenced by manifest.json.
//
// @codemirror/* and yjs are marked external: plugins must consume the host
// instances exposed at api.modules, never bundle their own copy.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icons as phosphorIcons } from "@iconify-json/ph";
import { icons as tablerIcons } from "@iconify-json/tabler";
import phosphorMapping from "./plugins/icons-phosphor/mapping.json" with { type: "json" };
import tablerMapping from "./plugins/icons-tabler/mapping.json" with { type: "json" };

const root = dirname(fileURLToPath(import.meta.url));
const pluginsDir = join(root, "plugins");

const entries = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(pluginsDir, entry.name, "src", "main.ts"))
  .filter((entryPoint) => existsSync(entryPoint));

if (entries.length === 0) {
  console.log("No TypeScript plugins found.");
  process.exit(0);
}

console.log(`Type-checking ${entries.length} plugin(s)...`);
execFileSync("npx", ["tsc", "--noEmit", "-p", "tsconfig.json"], {
  cwd: root,
  stdio: "inherit",
});

function buildIconPack(name, icons, mapping) {
  const output = {};
  for (const [id, icon] of Object.entries(icons.icons)) {
    const width = icon.width ?? icons.width ?? 24;
    const height = icon.height ?? icons.height ?? 24;
    output[id] = {
      body: icon.body,
      viewBox: `0 0 ${width} ${height}`,
      keywords: id.split("-"),
    };
  }

  for (const iconId of Object.values(mapping)) {
    if (!output[iconId]) throw new Error(`missing mapped ${name} icon: ${iconId}`);
  }

  return `${JSON.stringify({ icons: output })}\n`;
}

console.log("Generating icon packs...");
writeFileSync(
  join(pluginsDir, "icons-phosphor", "pack.json"),
  buildIconPack("Phosphor", phosphorIcons, phosphorMapping),
);
writeFileSync(
  join(pluginsDir, "icons-tabler", "pack.json"),
  buildIconPack("Tabler", tablerIcons, tablerMapping),
);

for (const entryPoint of entries) {
  const outfile = join(dirname(dirname(entryPoint)), "main.js");
  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    format: "esm",
    target: "es2022",
    external: ["@codemirror/*", "yjs"],
    logLevel: "info",
  });
}
