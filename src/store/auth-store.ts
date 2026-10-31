import Cookies from "js-cookie";
import { create } from "zustand";
import { authService } from "@/lib/api/auth";
import { decodeToken, isTokenExpired, TOKEN_COOKIE } from "@/lib/auth";
import type { User } from "@/types";

/** idle: not checked yet · loading: validating a stored token with /auth/me */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  setSession: (token: string, user: User) => void;
  /** Replaces the signed-in user (e.g. after a profile edit); the token is unchanged. */
  setUser: (user: User) => void;
  clearSession: () => void;
  /** Restores the session from the cookie once per page load. */
  hydrate: () => Promise<void>;
  /** Re-reads /auth/me (e.g. on tab focus) and returns the previous and new user. */
  refreshUser: () => Promise<{ previous: User; next: User } | null>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  status: "idle",

  setSession: (token, user) => {
    const payload = decodeToken(token);

    // The cookie expires with the token, so the proxy never sees a stale one.
    Cookies.set(TOKEN_COOKIE, token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: payload ? new Date(payload.exp * 1000) : undefined,
    });

    set({ token, user, status: "authenticated" });
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    Cookies.remove(TOKEN_COOKIE, { path: "/" });
    set({ token: null, user: null, status: "unauthenticated" });
  },

  hydrate: async () => {
    if (get().status !== "idle") return;

    const token = Cookies.get(TOKEN_COOKIE);
    const payload = token ? decodeToken(token) : null;

    if (!token || !payload || isTokenExpired(payload)) {
      get().clearSession();
      return;
    }

    set({ token, status: "loading" });

    try {
      // Quietly drop a token the backend rejects; no "expired" toast on load.
      const user = await authService.getMe({ token, skipSessionHandling: true });
      set({ user, status: "authenticated" });
    } catch {
      get().clearSession();
    }
  },

  refreshUser: async () => {
    const { token, user: previous, status } = get();
    if (status !== "authenticated" || !token || !previous) return null;
    // Normal session handling applies: a blocked account is signed out.
    const next = await authService.getMe();
    // Ignore the answer if the session changed while it was in flight.
    if (get().token !== token) return null;
    set({ user: next });
    return { previous, next };
  },
}));
