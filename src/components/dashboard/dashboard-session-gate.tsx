"use client";

import Loading from "@/app/dashboard/loading";
import { useAuth } from "@/hooks/use-auth";

/**
 * Dashboard pages render only with a confirmed session. Before the stored
 * token is checked (a fresh load or a redirect) and after logging out, their
 * queries would run without a token and fail, so a skeleton shows instead.
 */
export function DashboardSessionGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Loading />;
}
