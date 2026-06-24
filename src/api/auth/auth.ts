import { api } from "@/api/api";
import { parseResponse, type Result } from "@/api/result";
import {
  type LoginInput,
  MeSchema,
  type RegisterInput,
  type Session,
  SessionSchema,
  type User,
} from "./types";

/**
 * Raw auth API functions. They validate the wire shape with Zod and return a `Result`.
 * Components never call these directly — they go through the auth context (see context/).
 */

export async function login(input: LoginInput): Promise<Result<Session>> {
  // No token yet → skip the 401-retry machinery.
  const res = await api.post<unknown>("/auth/login", input, { skipAuthRetry: true });
  if (!res.ok) return res;
  return parseResponse(res.data, SessionSchema, { endpoint: "POST /auth/login" });
}

export async function register(input: RegisterInput): Promise<Result<Session>> {
  const res = await api.post<unknown>("/auth/register", input, { skipAuthRetry: true });
  if (!res.ok) return res;
  return parseResponse(res.data, SessionSchema, { endpoint: "POST /auth/register" });
}

/** Rotate the refresh cookie → fresh session. Must skip the retry loop (it IS the refresh). */
export async function refresh(): Promise<Result<Session>> {
  const res = await api.post<unknown>("/auth/refresh", undefined, { skipAuthRetry: true });
  if (!res.ok) return res;
  return parseResponse(res.data, SessionSchema, { endpoint: "POST /auth/refresh" });
}

export async function logout(): Promise<Result<void>> {
  return api.post<void>("/auth/logout", undefined, { skipAuthRetry: true });
}

export async function me(): Promise<Result<User>> {
  const res = await api.get<unknown>("/auth/me");
  if (!res.ok) return res;
  const parsed = parseResponse(res.data, MeSchema, { endpoint: "GET /auth/me" });
  return parsed.ok ? { ok: true, data: parsed.data.user } : parsed;
}
