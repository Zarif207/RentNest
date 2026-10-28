"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { SidebarContent } from "@/components/dashboard/dashboard-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { activeNavItem, DASHBOARD_NAV, dashboardRoleFromPath } from "@/lib/dashboard-nav";

export function DashboardTopbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const role = dashboardRoleFromPath(pathname);
  const title = (role && activeNavItem(DASHBOARD_NAV[role], pathname)?.label) ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Below lg the sidebar lives in a sheet. */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open dashboard menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate between dashboard pages</SheetDescription>
          <SidebarContent onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <p className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{title}</p>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        {isLoading || !user ? (
          <Skeleton className="size-9 rounded-full" />
        ) : (
          <UserMenu user={user} />
        )}
      </div>
    </header>
  );
}
