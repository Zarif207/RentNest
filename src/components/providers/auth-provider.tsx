"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setSessionErrorHandler, type ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

// One toast id, so a burst of failing requests shows a single message.
const SESSION_TOAST_ID = "session-error";

// Re-check the profile at most this often when the tab regains focus.
const REFRESH_INTERVAL_MS = 10_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  // Coming back to the tab re-reads /auth/me, so an admin's approval (or
  // rejection) of a landlord takes effect without logging out.
  useEffect(() => {
    let last = 0;
    const refresh = async () => {
      if (document.visibilityState !== "visible" || Date.now() - last < REFRESH_INTERVAL_MS) return;
      last = Date.now();
      try {
        const result = await useAuthStore.getState().refreshUser();
        if (!result || result.previous.landlordStatus === result.next.landlordStatus) return;
        if (result.next.landlordStatus === "APPROVED") {
          toast.success("You're approved!", { description: "You can list properties and manage requests now." });
        } else if (result.next.landlordStatus === "REJECTED") {
          toast.error("Your landlord application was rejected", { description: "Contact us if you think this is a mistake." });
        }
      } catch {
        // Offline or a hiccup: keep the current session and try again on the next focus.
      }
    };
    const onVisible = () => void refresh();
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
