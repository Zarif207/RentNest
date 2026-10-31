"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { House, LogOut, MoreHorizontal, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { usePendingOfferCount } from "@/hooks/use-landlord-offers";
import { usePendingRequestCount } from "@/hooks/use-landlord-requests";
import {
  activeNavItem,
  DASHBOARD_NAV,
  dashboardRoleFromPath,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

const iconButton =
  "grid size-10 place-items-center rounded-full bg-foreground/5 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50";

function useDashboardNav() {
  const pathname = usePathname();
  const role = dashboardRoleFromPath(pathname);
  const items = role ? DASHBOARD_NAV[role] : [];
  // Landlords see how many requests are waiting on "Requests".
  const pendingRequests = usePendingRequestCount(role === "LANDLORD");
  const pendingOffers = usePendingOfferCount(role === "LANDLORD");
  return {
    role,
    items,
    active: activeNavItem(items, pathname),
    badgeFor: (item: DashboardNavItem) =>
      item.href === "/dashboard/landlord/requests"
        ? pendingRequests
        : item.href === "/dashboard/landlord/offers"
          ? pendingOffers
          : 0,
  };
}

function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground",
        className,
      )}
    >
      {count}
      <span className="sr-only"> pending</span>
    </span>
  );
}

/**
 * Pill navigation: the active page is a filled ink pill that glides between
 * items. "inline" sits inside the top bar on wide screens; "row" is the same
 * pills on their own line under the bar for narrower desktops and tablets.
 */
function PillNav({ variant }: { variant: "inline" | "row" }) {
  const { items, active, badgeFor } = useDashboardNav();
  // Profile lives in the avatar menu; keeps the pill row short.
  const pills = items.filter((item) => !item.href.endsWith("/profile"));
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Dashboard"
      className={cn(
        variant === "inline"
          ? "hidden lg:block"
          : "mx-auto mt-2 hidden max-w-7xl overflow-x-auto scrollbar-none md:block lg:hidden",
      )}
    >
      <ul className={cn("flex items-center gap-1.5", variant === "row" && "w-max min-w-full justify-center p-0.5")}>
        {pills.map((item) => {
          const isActive = item === active;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 xl:px-5",
                  isActive
                    ? "text-background"
                    : variant === "row"
                      ? "border border-border bg-card/80 text-foreground/80 backdrop-blur-xl hover:bg-card hover:text-foreground"
                      : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={`dashboard-pill-${variant}`}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.15, duration: 0.5 }}
                    className="absolute inset-0 rounded-full bg-foreground"
                  />
                )}
                <span className="relative">{item.label}</span>
                <CountBadge count={badgeFor(item)} className="relative" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Search listings from anywhere in the dashboard (goes to /properties?searchTerm=…). */
function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("q")?.toString().trim();
    setOpen(false);
    router.push(term ? `/properties?searchTerm=${encodeURIComponent(term)}` : "/properties");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label="Search listings" className={iconButton}>
        <Search className="size-4.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl p-3">
        <form onSubmit={onSubmit} role="search" className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input name="q" type="search" autoFocus aria-label="Search listings" placeholder="Search listings…" className="h-11 rounded-full pl-10" />
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Mobile: a floating bottom tab bar with up to four pages and a "More" sheet. */
function MobileTabBar() {
  const { items, active, badgeFor } = useDashboardNav();
  const { user } = useAuth();
  const logout = useLogout();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = items.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-border bg-background/85 p-1.5 shadow-2xl shadow-black/15 backdrop-blur-xl md:hidden"
    >
      <ul className="flex items-center justify-between gap-1">
        {primary.map((item) => {
          const isActive = item === active;
          const badge = badgeFor(item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4.5" aria-hidden />
                <span className="max-w-full truncate px-1">{item.label}</span>
                <CountBadge count={badge} className="absolute top-1 right-2 h-4 min-w-4 text-[10px]" />
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger className="flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <MoreHorizontal className="size-4.5" aria-hidden />
              More
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8">
              <SheetTitle className="px-6 pt-6">Menu</SheetTitle>
              <SheetDescription className="sr-only">All dashboard pages and sign out</SheetDescription>
              {user && (
                <div className="mx-4 flex items-center gap-3 rounded-2xl bg-muted p-3">
                  <UserAvatar name={user.name} className="size-10" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <ul className="grid grid-cols-2 gap-2 px-4">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={item === active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium",
                        item === active ? "bg-foreground text-background" : "bg-foreground/5",
                      )}
                    >
                      <item.icon className="size-4" aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      <CountBadge count={badgeFor(item)} />
                    </Link>
                  </li>
                ))}
                <li className="col-span-2">
                  <Link
                    href="/"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 rounded-2xl bg-foreground/5 px-4 py-3 text-sm font-medium"
                  >
                    <House className="size-4" aria-hidden /> Back to home
                  </Link>
                </li>
                <li className="col-span-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" aria-hidden /> Log out
                  </button>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}

/** Floating top bar: logo, pill navigation, search, notifications, theme and account. */
export function DashboardTopbar() {
  const { role } = useDashboardNav();
  const { user, isLoading } = useAuth();

  return (
    <>
      <div className="sticky top-0 z-30 px-3 pt-3">
        <header className="mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-full border border-border bg-card/80 pr-3 pl-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/30">
          <div className="flex flex-1 items-center">
            <BrandLogo href={role ? DASHBOARD_NAV[role][0].href : "/"} className="xl:hidden" variant="mark" />
            <BrandLogo href={role ? DASHBOARD_NAV[role][0].href : "/"} size="sm" className="hidden xl:inline-flex" />
          </div>
          <PillNav variant="inline" />
          <div className="flex flex-1 items-center justify-end gap-1.5">
            <Link href="/" aria-label="Back to home page" title="Home" className={iconButton}>
              <House className="size-4.5" aria-hidden />
            </Link>
            <SearchButton />
            {role && <NotificationsMenu role={role} />}
            <ThemeToggle className="size-10 rounded-full bg-foreground/5 hover:bg-foreground/10" />
            {isLoading || !user ? <Skeleton className="size-10 rounded-full" /> : <UserMenu user={user} />}
          </div>
        </header>
        <PillNav variant="row" />
      </div>
      <MobileTabBar />
    </>
  );
}
