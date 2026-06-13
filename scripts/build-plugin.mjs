// Shared build step for TypeScript community plugins.
//
// Each plugin's own build.mjs imports its local `esbuild` (so module
// resolution finds the plugin's node_modules) and passes it here:
//
//   import * as esbuild from "esbuild";
//   import { buildPlugin } from "../../scripts/build-plugin.mjs";
//   await buildPlugin(esbuild);
//
// Type-checks `src/main.ts` against `tsconfig.json`, then bundles it to
// `main.js`, matching the runtime modules exposed at `api.modules`.
import { execFileSync } from "node:child_process";

export async function buildPlugin(esbuild, options = {}) {
  execFileSync("tsc", ["--noEmit", "-p", "tsconfig.json"], { stdio: "inherit" });

  await esbuild.build({
    entryPoints: ["src/main.ts"],
    outfile: "main.js",
    bundle: true,
    format: "esm",
    target: "es2022",
    external: ["@codemirror/*", "yjs"],
    ...options,
  });
}
