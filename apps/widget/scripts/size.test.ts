import { describe, expect, it } from "vitest";
import { MAX_WIDGET_BYTES, checkSize } from "./size.mjs";

describe("checkSize", () => {
  it("caps the widget at 5 kb", () => {
    expect(MAX_WIDGET_BYTES).toBe(5120);
  });

  it("passes at or under the limit", () => {
    expect(checkSize(0).ok).toBe(true);
    expect(checkSize(MAX_WIDGET_BYTES).ok).toBe(true);
  });

  it("fails over the limit", () => {
    const result = checkSize(MAX_WIDGET_BYTES + 1);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("over the limit");
  });
});
