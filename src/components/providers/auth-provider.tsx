"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setSessionErrorHandler, type ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

// One toast id, so a burst of failing requests shows a single message.
const SESSION_TOAST_ID = "session-error";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    setSessionErrorHandler((error: ApiError) => {
      // Several requests can fail together; only the first one acts.
      if (!useAuthStore.getState().token) return;

      useAuthStore.getState().clearSession();
      queryClient.clear();

      if (error.status === 403) {
        toast.error("Your account has been blocked", {
          id: SESSION_TOAST_ID,
          description: "Please contact support if you think this is a mistake.",
        });
        router.replace("/auth/login");
        return;
      }

      toast.error("Session expired", {
        id: SESSION_TOAST_ID,
        description: "Please log in again to continue.",
      });

      const path = `${window.location.pathname}${window.location.search}`;
      router.replace(
        path.startsWith("/auth")
          ? "/auth/login"
          : `/auth/login?redirect=${encodeURIComponent(path)}`,
      );
    });

    return () => setSessionErrorHandler(undefined);
  }, [queryClient, router]);

  return children;
}
