"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { usePendingRequestCount } from "@/hooks/use-landlord-requests";
import { activeNavItem, DASHBOARD_NAV, dashboardRoleFromPath } from "@/lib/dashboard-nav";
import { formatEnumLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Logo, role navigation and the signed-in user card. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = dashboardRoleFromPath(pathname);
  const items = role ? DASHBOARD_NAV[role] : [];
  const active = activeNavItem(items, pathname);
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  // Landlords see how many requests are waiting on the "Requests" item.
  const pendingRequests = usePendingRequestCount(role === "LANDLORD");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <BrandLogo />
      </div>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {role ? `${formatEnumLabel(role)} menu` : "Menu"}
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item === active;
            const badge = item.href === "/dashboard/landlord/requests" ? pendingRequests : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4.5 shrink-0" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-gold-foreground">
                      {badge}
                      <span className="sr-only"> pending</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        {isLoading || !user ? (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl p-2">
            <UserAvatar name={user.name} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Log out" onClick={logout}>
              <LogOut />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
      <SidebarContent />
    </aside>
  );
}
