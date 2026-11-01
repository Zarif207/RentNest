"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";

const MAX_RETRIES = 2;

// 4xx responses won't change on retry; network errors and 5xx might.
function shouldRetry(failureCount: number, error: unknown) {
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// One toast id, so "Back online" replaces the offline notice.
const CONNECTION_TOAST_ID = "connection";

/**
 * While offline, TanStack Query pauses requests and sends them on reconnect,
 * so a save or a request would just keep spinning; this says why.
 */
function useConnectionToasts() {
  useEffect(() => {
    const offline = () =>
      toast.warning("You're offline", {
        id: CONNECTION_TOAST_ID,
        description: "Changes you make will be sent when you reconnect.",
        duration: Infinity,
      });
    // Same id, so it replaces the notice; it needs its own description too.
    const online = () =>
      toast.success("Back online", { id: CONNECTION_TOAST_ID, description: "You're connected again.", duration: 3000 });
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser session, created lazily so it survives re-renders.
  const [queryClient] = useState(createQueryClient);
  useConnectionToasts();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
