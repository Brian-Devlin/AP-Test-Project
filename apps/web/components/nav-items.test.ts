import { describe, expect, it } from "vitest";
import { DASHBOARD_NAV, isNavActive } from "./nav-items";

describe("DASHBOARD_NAV", () => {
  it("lists the dashboard sections in order", () => {
    expect(DASHBOARD_NAV.map((i) => i.label)).toEqual([
      "Projects",
      "Knowledge",
      "Conversations",
      "Customize",
      "Install",
      "Billing",
    ]);
  });

  it("keeps every link under /dashboard", () => {
    for (const item of DASHBOARD_NAV) expect(item.href.startsWith("/dashboard")).toBe(true);
  });
});

describe("isNavActive", () => {
  it("matches the dashboard root only on itself", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/dashboard", "/dashboard/")).toBe(true);
    expect(isNavActive("/dashboard", "/dashboard/knowledge")).toBe(false);
  });

  it("matches a section and its sub-pages", () => {
    expect(isNavActive("/dashboard/knowledge", "/dashboard/knowledge")).toBe(true);
    expect(isNavActive("/dashboard/knowledge", "/dashboard/knowledge/abc")).toBe(true);
  });

  it("doesn't match a sibling that shares a prefix", () => {
    expect(isNavActive("/dashboard/install", "/dashboard/installer")).toBe(false);
    expect(isNavActive("/dashboard/billing", "/dashboard")).toBe(false);
  });
});
