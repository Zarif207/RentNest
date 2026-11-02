"use client";

import { Eye } from "lucide-react";
import Loading from "@/app/dashboard/loading";
import { useAuth } from "@/hooks/use-auth";

/**
 * Dashboard pages render only with a confirmed session. Before the stored
 * token is checked (a fresh load or a redirect) and after logging out, their
 * queries would run without a token and fail, so a skeleton shows instead.
 * Observers also get a note that the dashboards are read-only for them.
 */
export function DashboardSessionGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Loading />;
  return (
    <>
      {user?.role === "OBSERVER" && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-3xl border border-border bg-card px-5 py-3 text-sm"
        >
          <Eye className="size-4 shrink-0 text-bronze" aria-hidden />
          Read-only observer account: you can view everything, but changes are turned off and personal details are
          masked.
        </p>
      )}
      {children}
    </>
  );
}
