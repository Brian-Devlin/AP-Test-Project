// Fails the build if dist/widget.js is over 5 kb.
import { statSync } from "node:fs";
import { checkSize } from "./size.mjs";

const { ok, message } = checkSize(statSync("dist/widget.js").size);
if (ok) {
  console.log(message);
} else {
  console.error(message);
  process.exit(1);
}
