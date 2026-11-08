import { defineConfig } from "vitest/config";

// One Vitest run covers every workspace package. A package can add its own
// vitest.config.ts later (e.g. apps/web with jsdom) and it will be picked up.
export default defineConfig({
  test: {
    projects: ["apps/*", "packages/*"],
    passWithNoTests: true,
  },
});
