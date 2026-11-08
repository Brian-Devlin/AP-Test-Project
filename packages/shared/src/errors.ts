import { z } from "zod";

/** Every error code an API route may return, with its HTTP status. */
export const ERROR_STATUS = {
  invalid_request: 400,
  unauthorized: 401,
  invalid_signature: 401,
  plan_required: 402,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  file_too_large: 413,
  unsupported_file_type: 415,
  invalid_file: 422,
  project_limit_reached: 403,
  knowledge_limit_reached: 403,
  quota_exceeded: 429,
  rate_limited: 429,
  message_blocked: 403,
  internal_error: 500,
} as const satisfies Record<string, number>;

export type ErrorCode = keyof typeof ERROR_STATUS;

export const ERROR_CODES = Object.keys(ERROR_STATUS) as ErrorCode[];
export const errorCodeSchema = z.enum(ERROR_CODES as [ErrorCode, ...ErrorCode[]]);

/** The error body every route returns: `{ error: { code, message } }`. */
export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
  }),
});

/** Build an error body. Pair it with `ERROR_STATUS[code]` as the HTTP status. */
export function apiError(code: ErrorCode, message: string): ApiError {
  return { error: { code, message } };
}
