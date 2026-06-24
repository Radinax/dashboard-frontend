import { config } from "@/config";
import { type ApiError, apiError, err, ok, type Result } from "./result";

/**
 * The single API client. Every request goes through here, so the cross-cutting concerns —
 * auth header injection, 401-driven token refresh + retry, error normalization — live in
 * exactly one place and behave consistently everywhere.
 */

// Registered once at startup by the auth provider, to avoid a client ↔ auth import cycle.
let getAccessToken: () => string | null = () => null;
let refreshSession: (() => Promise<boolean>) | null = null;

export function configureApiAuth(opts: {
  getAccessToken: () => string | null;
  refresh: () => Promise<boolean>;
}) {
  getAccessToken = opts.getAccessToken;
  refreshSession = opts.refresh;
}

interface RequestOptions {
  /** Parsed JSON body to send. */
  body?: unknown;
  /** Skip the automatic 401 → refresh → retry (used by the auth endpoints themselves). */
  skipAuthRetry?: boolean;
  signal?: AbortSignal;
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<Result<T>> {
  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";

    return fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: "include", // send/receive the httpOnly refresh cookie
      signal: opts.signal,
    });
  };

  let res: Response;
  try {
    res = await doFetch();
  } catch {
    return err(apiError("network_error", "Network request failed. Check your connection."));
  }

  // 401 → try a single silent refresh, then replay the original request once.
  if (res.status === 401 && !opts.skipAuthRetry && refreshSession) {
    const refreshed = await refreshSession();
    if (refreshed) {
      try {
        res = await doFetch();
      } catch {
        return err(apiError("network_error", "Network request failed. Check your connection."));
      }
    }
  }

  return toResult<T>(res, `${method} ${path}`);
}

async function toResult<T>(res: Response, endpoint: string): Promise<Result<T>> {
  if (res.status === 204) return ok(undefined as T);

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const body = payload as { code?: string; message?: string; details?: unknown } | null;
    return err(
      apiError(
        body?.code ?? "http_error",
        body?.message ?? `Request to ${endpoint} failed (${res.status})`,
        res.status,
        body?.details,
      ),
    );
  }

  return ok(payload as T);
}

/** Raw client. Domain code parses the `data` with Zod via `parseResponse` (see result.ts). */
export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
};

export type { ApiError, Result };
