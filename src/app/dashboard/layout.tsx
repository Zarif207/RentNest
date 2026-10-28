import { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

// The sidebar and top bar read the pathname; dynamic dashboard routes
// (e.g. /requests/[id]/pay) need a boundary around them to prerender.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-svh bg-surface">
      <Suspense fallback={null}>
        <DashboardSidebar />
      </Suspense>
      <div className="flex min-h-svh flex-col lg:pl-64">
        <Suspense fallback={<div className="h-16 border-b bg-background" />}>
          <DashboardTopbar />
        </Suspense>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
