import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

// Dashboards are private: keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The top bar reads the pathname; dynamic dashboard routes
// (e.g. /requests/[id]/pay) need a boundary around it to prerender.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-svh bg-canvas">
      <Suspense fallback={<div className="h-19" />}>
        <DashboardTopbar />
      </Suspense>
      {/* Bottom padding clears the floating tab bar on phones. */}
      <main id="main" className="px-3 pt-6 pb-28 sm:px-4 sm:pt-8 md:pb-12">
        <div className="mx-auto w-full max-w-7xl lg:px-2">{children}</div>
      </main>
    </div>
  );
}
