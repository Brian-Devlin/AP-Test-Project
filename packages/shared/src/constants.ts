/** The product name. Landing page, dashboard, widget badge and page titles read it from here. */
export const APP_NAME = "Askwell";

/** Max visitor message length in characters (project.md §6.6). */
export const MAX_MESSAGE_CHARS = 1_000;

/** Max knowledge file size: 10 MB (project.md §6.4). The bucket enforces the same. */
export const MAX_KNOWLEDGE_FILE_BYTES = 10 * 1024 * 1024;

/** Max pasted knowledge text length in characters. Bounds embedding cost per source. */
export const MAX_KNOWLEDGE_TEXT_CHARS = 200_000;

/** Field length limits for owner-entered text. */
export const MAX_PROJECT_NAME_CHARS = 80;
export const MAX_KNOWLEDGE_TITLE_CHARS = 200;
export const MAX_FILE_NAME_CHARS = 255;
export const MAX_WIDGET_LABEL_CHARS = 40;
export const MAX_WIDGET_HEADER_TEXT_CHARS = 80;
export const MAX_VISITOR_ID_CHARS = 128;

/** Public keys are `pk_` + random URL-safe characters (project.md §6.3). */
export const PUBLIC_KEY_PREFIX = "pk_";
export const PUBLIC_KEY_PATTERN = /^pk_[A-Za-z0-9_-]{16,64}$/;

/** True when `value` has the public key format. Says nothing about whether the key exists. */
export function isPublicKey(value: string): boolean {
  return PUBLIC_KEY_PATTERN.test(value);
}

/** Widget button colors are 6-digit hex, e.g. `#111111`. */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
