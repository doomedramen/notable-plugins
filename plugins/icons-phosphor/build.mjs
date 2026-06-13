import { writeFile } from "node:fs/promises";
import { icons } from "@iconify-json/ph";
import mapping from "./mapping.json" with { type: "json" };

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
  if (!output[iconId]) throw new Error(`missing mapped Phosphor icon: ${iconId}`);
}

await writeFile(
  new URL("./pack.json", import.meta.url),
  `${JSON.stringify({ icons: output })}\n`
);
