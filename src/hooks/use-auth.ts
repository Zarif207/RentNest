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

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ accessToken, user }) => {
      setSession(accessToken, user);
      toast.success(`Welcome back, ${user.name}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Registers, then logs in with the same credentials (register issues no token). */
export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await authService.register(input);
      return authService.login({ email: input.email, password: input.password });
    },
    onSuccess: ({ accessToken, user }) => {
      setSession(accessToken, user);
      toast.success(`Welcome to RentNest, ${user.name}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(() => {
    clearSession();
    queryClient.clear();
    toast.success("You have been logged out");
    router.push("/");
  }, [clearSession, queryClient, router]);
}
