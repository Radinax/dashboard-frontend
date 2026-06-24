import type { z } from "zod";

/**
 * An explicit success-or-error value (Rust/Go style) instead of throwing. Callers must
 * handle both paths — `if (!result.ok) …` — which is the whole point: no silent failures.
 */
export type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/** A normalized API error. `code` is a stable machine string the UI can branch on. */
export interface ApiError {
  /** Stable machine code, e.g. "INVALID_CREDENTIALS", "network_error", "schema_validation_failed". */
  code: string;
  /** Human-readable message — always safe to show in a toast. */
  message: string;
  /** HTTP status when there was a response (0 for network/parse failures). */
  status: number;
  details?: unknown;
}

export const apiError = (
  code: string,
  message: string,
  status = 0,
  details?: unknown,
): ApiError => ({ code, message, status, details });

/**
 * Validate a value against a Zod schema at the wire boundary. On mismatch we return a loud,
 * traceable error pointing at the endpoint — never `as T` (which is a lie at runtime).
 */
export function parseResponse<T>(
  value: unknown,
  schema: z.ZodType<T>,
  ctx: { endpoint: string },
): Result<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return err(
      apiError(
        "schema_validation_failed",
        `Unexpected response shape from ${ctx.endpoint}`,
        0,
        parsed.error.issues,
      ),
    );
  }
  return ok(parsed.data);
}
