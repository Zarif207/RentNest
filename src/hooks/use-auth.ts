"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { authService } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { RegisterInput } from "@/types";

export function useAuth() {
  return useAuthStore(
    useShallow(({ user, token, status }) => ({
      user,
      token,
      status,
      isAuthenticated: status === "authenticated",
      // True until the stored session has been checked.
      isLoading: status === "idle" || status === "loading",
    })),
  );
}

/**
 * After signing in or out, drop every cached query so no data from the
 * previous user survives. No router.refresh(): refreshing a page the proxy
 * now redirects (the login page once signed in, a dashboard once signed out)
 * sends its RSC request through an HTTP redirect, which Next answers with a
 * 404 and the page breaks until a reload. Callers navigate straight to a
 * page the proxy lets through instead.
 */
function useResetSessionCache() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    void queryClient.cancelQueries();
    queryClient.removeQueries();
  }, [queryClient]);
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const resetCache = useResetSessionCache();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ accessToken, user }) => {
      resetCache();
      setSession(accessToken, user);
      toast.success(`Welcome back, ${user.name}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Registers, then logs in with the same credentials (register issues no token). */
export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const resetCache = useResetSessionCache();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await authService.register(input);
      return authService.login({ email: input.email, password: input.password });
    },
    onSuccess: ({ accessToken, user }) => {
      resetCache();
      setSession(accessToken, user);
      if (user.role === "LANDLORD") {
        toast.success("Your landlord account was created", {
          description: "An admin will review it shortly. You can explore your dashboard meanwhile.",
          duration: 8000,
        });
      } else {
        toast.success(`Welcome to RentNest, ${user.name}`);
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const resetCache = useResetSessionCache();
  const router = useRouter();

  return useCallback(() => {
    // Dashboards unmount their content once the session is gone (see
    // DashboardSessionGate), so nothing refetches without a token.
    clearSession();
    resetCache();
    toast.success("You have been logged out");
    router.replace("/");
  }, [clearSession, resetCache, router]);
}
