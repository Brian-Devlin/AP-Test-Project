import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

const WEB = "apps/web/**";

/** Scope Next's shareable configs to the web app. Global-ignore entries stay global. */
const forWeb = (configs) =>
  configs.map((c) => {
    const keys = Object.keys(c).filter((k) => k !== "name");
    if (keys.length === 1 && keys[0] === "ignores") return c;
    const files = c.files ? c.files.map((f) => `${WEB}/${f.replace(/^\*\*\//, "")}`) : [`${WEB}/*.{js,jsx,mjs,ts,tsx}`];
    return { ...c, files };
  });

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/.turbo/**", "**/coverage/**", "**/next-env.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  ...forWeb(nextCoreWebVitals),
  ...forWeb(nextTypescript),
  {
    settings: { next: { rootDir: "apps/web" } },
  },
);
