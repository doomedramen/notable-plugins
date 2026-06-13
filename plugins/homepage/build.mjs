import * as esbuild from "esbuild";
import { buildPlugin } from "../../scripts/build-plugin.mjs";

await buildPlugin(esbuild);
