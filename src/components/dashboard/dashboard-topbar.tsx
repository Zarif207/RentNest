"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
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
import { useMarkSectionRead, useNotificationSummary } from "@/hooks/use-notifications";
import {
  activeNavItem,
  DASHBOARD_NAV,
  dashboardRoleFromPath,
  sectionCounts,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

const iconButton =
  "grid size-10 place-items-center rounded-full bg-foreground/5 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50";

type NavBadge = { count: number; tone: "new" | "pending" } | null;

function useDashboardNav() {
  const pathname = usePathname();
  const role = dashboardRoleFromPath(pathname);
  const items = role ? DASHBOARD_NAV[role] : [];
  // Landlords see how many requests and offers are waiting on them.
  const pendingRequests = usePendingRequestCount(role === "LANDLORD");
  const pendingOffers = usePendingOfferCount(role === "LANDLORD");
  // Unread notifications per section, by their links.
  const summary = useNotificationSummary();
  const counts = sectionCounts(items, summary.data?.byLink);

  const pendingFor = (item: DashboardNavItem) =>
    item.href === "/dashboard/landlord/requests"
      ? pendingRequests
      : item.href === "/dashboard/landlord/offers"
        ? pendingOffers
        : 0;

  return {
    role,
    items,
    counts,
    active: activeNavItem(items, pathname),
    /** Red "new" count from notifications first; otherwise the gold pending count. */
    badgeFor: (item: DashboardNavItem): NavBadge => {
      const fresh = counts.get(item.href) ?? 0;
      if (fresh > 0) return { count: fresh, tone: "new" };
      const pending = pendingFor(item);
      return pending > 0 ? { count: pending, tone: "pending" } : null;
    },
    /** e.g. "Properties, 2 new": the badge itself is hidden from screen readers. */
    labelFor: (item: DashboardNavItem) => {
      const fresh = counts.get(item.href) ?? 0;
      const pending = pendingFor(item);
      return [item.label, fresh > 0 && `${fresh} new`, pending > 0 && `${pending} pending`].filter(Boolean).join(", ");
    },
  };
}

/**
 * Opening a section reads its notifications, which clears its badge. Each
 * section and count is tried once, so a failed request (which restores the
 * badge) doesn't retry in a loop; a new notification tries again.
 */
function useClearActiveSection() {
  const { active, counts } = useDashboardNav();
  const { mutate } = useMarkSectionRead();
  const tried = useRef<string | null>(null);
  const href = active?.href;
  const count = href ? (counts.get(href) ?? 0) : 0;

  useEffect(() => {
    if (!href || count === 0) return;
    const attempt = `${href}:${count}`;
    if (tried.current === attempt) return;
    tried.current = attempt;
    mutate(href);
  }, [href, count, mutate]);
}

/**
 * A small count pill. Red for new notifications, gold for pending work.
 * Callers position it absolutely (or give it a fixed slot) so it never shifts
 * the layout when it appears.
 */
function CountBadge({ badge, className }: { badge: NavBadge; className?: string }) {
  if (!badge) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums",
        badge.tone === "new" ? "bg-alert text-alert-foreground" : "bg-gold text-gold-foreground",
        className,
      )}
    >
      {badge.count > 99 ? "99+" : badge.count}
    </span>
  );
}

/**
 * Pill navigation: the active page is a filled ink pill that glides between
 * items. "inline" sits inside the top bar on wide screens; "row" is the same
 * pills on their own line under the bar for narrower desktops and tablets.
 */
function PillNav({ variant }: { variant: "inline" | "row" }) {
  const { items, active, badgeFor, labelFor } = useDashboardNav();
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
      {/* The row scrolls sideways, which clips overflow: p-1 leaves room for the corner badges. */}
      <ul className={cn("flex items-center gap-1.5", variant === "row" && "w-max min-w-full justify-center p-1")}>
        {pills.map((item) => {
          const isActive = item === active;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={labelFor(item)}
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
                  <m.span
                    layoutId={`dashboard-pill-${variant}`}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.15, duration: 0.5 }}
                    className="absolute inset-0 rounded-full bg-foreground"
                  />
                )}
                <span className="relative">{item.label}</span>
                <CountBadge badge={badgeFor(item)} className="absolute -top-1 -right-1 ring-2 ring-background" />
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
  const { items, active, badgeFor, labelFor } = useDashboardNav();
  const { user } = useAuth();
  const logout = useLogout();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = items.slice(0, 4);
  // A dot on "More" when a page inside it has a badge.
  const moreHasNew = items.slice(4).some((item) => badgeFor(item)?.tone === "new");

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
                aria-label={labelFor(item)}
                className={cn(
                  "relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4.5" aria-hidden />
                <span className="max-w-full truncate px-1">{item.label}</span>
                <CountBadge badge={badge} className="absolute top-1 right-2" />
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger
              aria-label={moreHasNew ? "More, new notifications" : "More"}
              className="relative flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <MoreHorizontal className="size-4.5" aria-hidden />
              More
              {moreHasNew && <span aria-hidden className="absolute top-2 right-3 size-2 rounded-full bg-alert" />}
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
                      aria-label={labelFor(item)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium",
                        item === active ? "bg-foreground text-background" : "bg-foreground/5",
                      )}
                    >
                      <item.icon className="size-4" aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      <CountBadge badge={badgeFor(item)} className="shrink-0" />
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
  useClearActiveSection();
  const { user, isLoading } = useAuth();

  return (
    <>
      <div className="sticky top-0 z-30 px-3 pt-3">
        <header className="mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-full border border-border bg-card/80 pr-3 pl-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/30">
          <div className="flex flex-1 items-center">
            <BrandLogo href={role ? DASHBOARD_NAV[role][0].href : "/"} className="[--logo-eye:var(--card)] xl:hidden" variant="mark" />
            <BrandLogo href={role ? DASHBOARD_NAV[role][0].href : "/"} size="sm" className="hidden [--logo-eye:var(--card)] xl:inline-flex" />
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
