import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  BADGE_TEXT,
  DEFAULT_WIDGET_CONFIG,
  ERROR_STATUS,
  MAX_KNOWLEDGE_FILE_BYTES,
  MAX_MESSAGE_CHARS,
  PLAN_LIMITS,
  WIDGET_ANIMATIONS,
  WIDGET_POSITIONS,
  WIDGET_SETTING_KEYS,
  apiError,
  apiErrorSchema,
  applyPlanToWidgetConfig,
  canCustomizeWidget,
  isPublicKey,
  planSchema,
} from "./index";
import type { WidgetSettings } from "./index";

describe("APP_NAME", () => {
  it("is the product name", () => {
    expect(APP_NAME).toBe("Askwell");
    expect(BADGE_TEXT).toBe("Powered by Askwell");
  });
});

describe("constants", () => {
  it("match project.md §6", () => {
    expect(MAX_MESSAGE_CHARS).toBe(1000);
    expect(MAX_KNOWLEDGE_FILE_BYTES).toBe(10 * 1024 * 1024);
  });

  it("checks the pk_ public key format", () => {
    expect(isPublicKey("pk_a1B2c3D4e5F6g7H8i9J0")).toBe(true);
    expect(isPublicKey("pk_short")).toBe(false);
    expect(isPublicKey("sk_a1B2c3D4e5F6g7H8i9J0")).toBe(false);
    expect(isPublicKey("pk_a1B2c3D4e5F6g7H8<script>")).toBe(false);
  });
});

describe("planSchema", () => {
  it("accepts free and pro only", () => {
    expect(planSchema.parse("free")).toBe("free");
    expect(planSchema.parse("pro")).toBe("pro");
    expect(planSchema.safeParse("enterprise").success).toBe(false);
  });
});

describe("PLAN_LIMITS (project.md §5)", () => {
  it("Free: 1 project, 100 messages, 3 sources, nothing customizable", () => {
    expect(PLAN_LIMITS.free).toEqual({
      projects: 1,
      messagesPerMonth: 100,
      knowledgeSources: 3,
      customizable: [],
      positions: ["bottom-right"],
      animations: ["fade"],
    });
  });

  it("Pro: 5 projects, 2,000 messages, 25 sources, everything customizable", () => {
    expect(PLAN_LIMITS.pro).toEqual({
      projects: 5,
      messagesPerMonth: 2000,
      knowledgeSources: 25,
      customizable: [...WIDGET_SETTING_KEYS],
      positions: [...WIDGET_POSITIONS],
      animations: ["fade", "slide", "scale"],
    });
    expect(WIDGET_POSITIONS).toHaveLength(4);
    expect(WIDGET_ANIMATIONS).toEqual(["fade", "slide", "scale"]);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(PLAN_LIMITS)).toBe(true);
    expect(Object.isFrozen(PLAN_LIMITS.free)).toBe(true);
    expect(Object.isFrozen(DEFAULT_WIDGET_CONFIG)).toBe(true);
  });

  it("only Pro can customize the widget", () => {
    expect(canCustomizeWidget("free")).toBe(false);
    expect(canCustomizeWidget("pro")).toBe(true);
  });
});

describe("DEFAULT_WIDGET_CONFIG", () => {
  it("is bottom-right, fade, badge on", () => {
    expect(DEFAULT_WIDGET_CONFIG.position).toBe("bottom-right");
    expect(DEFAULT_WIDGET_CONFIG.animation).toBe("fade");
    expect(DEFAULT_WIDGET_CONFIG.showBadge).toBe(true);
    expect(DEFAULT_WIDGET_CONFIG.buttonColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(DEFAULT_WIDGET_CONFIG.label.length).toBeGreaterThan(0);
    expect(DEFAULT_WIDGET_CONFIG.headerText.length).toBeGreaterThan(0);
  });
});

describe("applyPlanToWidgetConfig", () => {
  const custom: WidgetSettings = {
    buttonColor: "#ff0000",
    position: "top-left",
    label: "Help",
    animation: "scale",
    headerText: "Ask us",
    showBadge: false,
  };

  it("Free gets the defaults and the badge, whatever is stored", () => {
    expect(applyPlanToWidgetConfig(custom, "free")).toEqual(DEFAULT_WIDGET_CONFIG);
  });

  it("Pro keeps every stored setting", () => {
    expect(applyPlanToWidgetConfig(custom, "pro")).toEqual(custom);
  });
});

describe("errors", () => {
  it("builds the { error: { code, message } } shape", () => {
    const body = apiError("plan_required", "Upgrade to Pro");
    expect(body).toEqual({ error: { code: "plan_required", message: "Upgrade to Pro" } });
    expect(apiErrorSchema.safeParse(body).success).toBe(true);
  });

  it("rejects unknown codes", () => {
    expect(apiErrorSchema.safeParse({ error: { code: "nope", message: "x" } }).success).toBe(false);
  });

  it("maps codes to HTTP statuses", () => {
    expect(ERROR_STATUS.invalid_request).toBe(400);
    expect(ERROR_STATUS.unauthorized).toBe(401);
    expect(ERROR_STATUS.plan_required).toBe(402);
    expect(ERROR_STATUS.not_found).toBe(404);
    expect(ERROR_STATUS.rate_limited).toBe(429);
    expect(ERROR_STATUS.internal_error).toBe(500);
  });
});
