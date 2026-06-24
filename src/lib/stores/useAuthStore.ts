import { create } from "zustand";
import type { Session, User } from "@/api/auth/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  /** Access token kept in memory ONLY (never localStorage) — see the article's auth note. */
  accessToken: string | null;
  status: AuthStatus;
  setSession: (session: Session) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  setSession: (session) =>
    set({ user: session.user, accessToken: session.accessToken, status: "authenticated" }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, accessToken: null, status: "unauthenticated" }),
}));
