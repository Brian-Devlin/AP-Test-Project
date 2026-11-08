// Bundles src/index.ts into one self-contained file: dist/widget.js.
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/widget.js",
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  platform: "browser",
  legalComments: "none",
  logLevel: "info",
});
