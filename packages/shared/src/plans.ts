import { APP_NAME } from "./constants";
import type { Plan, WidgetAnimation, WidgetPosition, WidgetSettings } from "./domain";
import { WIDGET_ANIMATIONS, WIDGET_POSITIONS } from "./domain";

/** Every widget setting an owner can change on the Customize page. */
export type WidgetSettingKey = keyof WidgetSettings;

export const WIDGET_SETTING_KEYS = [
  "buttonColor",
  "position",
  "label",
  "animation",
  "headerText",
  "showBadge",
] as const satisfies readonly WidgetSettingKey[];

export interface PlanLimits {
  /** Max projects per account. */
  projects: number;
  /** Max visitor messages per project per monthly period. */
  messagesPerMonth: number;
  /** Max knowledge sources (files + pasted texts) per project. */
  knowledgeSources: number;
  /** Widget settings this plan may change. Others are forced to the default. */
  customizable: readonly WidgetSettingKey[];
  /** Button positions allowed on this plan. */
  positions: readonly WidgetPosition[];
  /** Open animations allowed on this plan. */
  animations: readonly WidgetAnimation[];
}

/** Default widget settings. Free projects always get these, badge included. */
export const DEFAULT_WIDGET_CONFIG: Readonly<WidgetSettings> = Object.freeze({
  buttonColor: "#111111",
  position: "bottom-right",
  label: "Chat with us",
  animation: "fade",
  headerText: "How can we help?",
  showBadge: true,
});

/** Plan limits (project.md §5). The single source of truth; the server reads these. */
export const PLAN_LIMITS: Readonly<Record<Plan, PlanLimits>> = Object.freeze({
  free: Object.freeze({
    projects: 1,
    messagesPerMonth: 100,
    knowledgeSources: 3,
    customizable: Object.freeze([]),
    positions: Object.freeze(["bottom-right"] as const),
    animations: Object.freeze(["fade"] as const),
  }),
  pro: Object.freeze({
    projects: 5,
    messagesPerMonth: 2_000,
    knowledgeSources: 25,
    customizable: WIDGET_SETTING_KEYS,
    positions: WIDGET_POSITIONS,
    animations: WIDGET_ANIMATIONS,
  }),
});

/** True when `plan` may save a custom widget config (Free → 402). */
export function canCustomizeWidget(plan: Plan): boolean {
  return PLAN_LIMITS[plan].customizable.length > 0;
}

/**
 * The config the widget actually shows: stored settings with every setting the
 * plan may not change reset to its default. A downgraded project falls back to
 * the defaults (and the badge) without its stored row being touched.
 */
export function applyPlanToWidgetConfig(stored: WidgetSettings, plan: Plan): WidgetSettings {
  const limits = PLAN_LIMITS[plan];
  const allowed = new Set<WidgetSettingKey>(limits.customizable);
  const pick = <K extends WidgetSettingKey>(key: K): WidgetSettings[K] =>
    allowed.has(key) ? stored[key] : DEFAULT_WIDGET_CONFIG[key];

  const position = pick("position");
  const animation = pick("animation");
  return {
    buttonColor: pick("buttonColor"),
    position: limits.positions.includes(position) ? position : DEFAULT_WIDGET_CONFIG.position,
    label: pick("label"),
    animation: limits.animations.includes(animation) ? animation : DEFAULT_WIDGET_CONFIG.animation,
    headerText: pick("headerText"),
    showBadge: pick("showBadge"),
  };
}

/** "Powered by Askwell": the badge text, built from APP_NAME. */
export const BADGE_TEXT = `Powered by ${APP_NAME}`;
