import Cookies from "js-cookie";
import { create } from "zustand";
import { authService } from "@/lib/api/auth";
import { TOKEN_COOKIE } from "@/lib/api/client";
import { decodeToken, isTokenExpired } from "@/lib/auth";
import type { User } from "@/types";

/** idle: not checked yet · loading: validating a stored token with /auth/me */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  /** Restores the session from the cookie once per page load. */
  hydrate: () => Promise<void>;
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
}));
