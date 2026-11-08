/** Hard cap for dist/widget.js (project.md §3). */
export const MAX_WIDGET_BYTES = 5 * 1024;

/**
 * @param {number} bytes size of the bundle
 * @param {number} [limit] max allowed bytes
 * @returns {{ ok: boolean, message: string }}
 */
export function checkSize(bytes, limit = MAX_WIDGET_BYTES) {
  const ok = bytes <= limit;
  const message = `dist/widget.js is ${bytes} B (limit ${limit} B)${ok ? "" : ": over the limit"}`;
  return { ok, message };
}
