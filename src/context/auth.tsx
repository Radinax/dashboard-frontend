import { createContext, use, useEffect } from "react";
import { configureApiAuth } from "@/api/api";
import * as authApi from "@/api/auth/auth";
import type { LoginInput, RegisterInput } from "@/api/auth/types";
import type { Result } from "@/api/result";
import { type AuthStatus, useAuthStore } from "@/lib/stores/useAuthStore";

// Wire the API client to the auth store ONCE, at module load — before any request runs.
// This is what lets the client inject the bearer token and silently refresh on 401,
// without importing the store (which would create a client ↔ auth cycle).
configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refresh: async () => {
    const result = await authApi.refresh();
    if (result.ok) {
      useAuthStore.getState().setSession(result.data);
      return true;
    }
    useAuthStore.getState().clear();
    return false;
  },
});

interface AuthContextValue {
  status: AuthStatus;
  login: (input: LoginInput) => Promise<Result<unknown>>;
  register: (input: RegisterInput) => Promise<Result<unknown>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const clear = useAuthStore((s) => s.clear);

  // On first load, try to restore a session from the refresh cookie.
  useEffect(() => {
    let active = true;
    authApi.refresh().then((result) => {
      if (!active) return;
      if (result.ok) setSession(result.data);
      else clear();
    });
    return () => {
      active = false;
    };
  }, [setSession, clear]);

  const value: AuthContextValue = {
    status,
    login: async (input) => {
      const result = await authApi.login(input);
      if (result.ok) setSession(result.data);
      return result;
    },
    register: async (input) => {
      const result = await authApi.register(input);
      if (result.ok) setSession(result.data);
      return result;
    },
    logout: async () => {
      await authApi.logout();
      clear();
      setStatus("unauthenticated");
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
