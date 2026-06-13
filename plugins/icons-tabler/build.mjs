import { writeFile } from "node:fs/promises";
import * as esbuild from "esbuild";
import { icons } from "@iconify-json/tabler";
import mapping from "./mapping.json" with { type: "json" };
import { buildPlugin } from "../../scripts/build-plugin.mjs";

const output = {};
for (const [id, icon] of Object.entries(icons.icons)) {
  const width = icon.width ?? icons.width ?? 24;
  const height = icon.height ?? icons.height ?? 24;
  output[id] = {
    body: icon.body,
    viewBox: `0 0 ${width} ${height}`,
    keywords: id.split("-")
  };
}

for (const iconId of Object.values(mapping)) {
  if (!output[iconId]) throw new Error(`missing mapped Tabler icon: ${iconId}`);
}

await writeFile(
  new URL("./pack.json", import.meta.url),
  `${JSON.stringify({ icons: output })}\n`
);

await buildPlugin(esbuild);
