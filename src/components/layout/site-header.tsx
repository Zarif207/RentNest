"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import * as m from "motion/react-m";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavSearch } from "@/components/layout/nav-search";
import { RoofBar, ROOF_HEIGHT } from "@/components/layout/roof-bar";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useScrolled } from "@/hooks/use-scrolled";
import { roleHome } from "@/lib/auth";
import { isActiveLink, PRIMARY_NAV_LINKS, SECONDARY_NAV_LINKS, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Fixed and centered, 14 px from the top. Desktop is the roof-peak bar
// (ROOF_HEIGHT tall); under 1024 px a compact 56 px bar. PageShell and the
// heroes leave room for both.
const SHELL = "fixed inset-x-0 top-3.5 z-50 px-4 sm:px-6";
const DESKTOP = "relative mx-auto hidden max-w-[1360px] lg:block";
const MOBILE_BAR =
  "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-(--roof-stroke) bg-(--roof-fill) pr-1.5 pl-5 backdrop-blur-[14px] transition-[background-color] duration-500 group-data-scrolled/header:bg-(--roof-fill-solid) lg:hidden";
// The peak's column: the stacked logo sits here, links keep clear of it.
const COLUMNS = "grid-cols-[1fr_300px_1fr] xl:grid-cols-[1fr_340px_1fr]";

/** First focusable element on every public page. */
function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60"
    >
      Skip to content
    </a>
  );
}

/** The stacked logo in the peak; the egg wobbles a little on hover. */
function PeakLogo() {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2">
      <BrandLogo variant="stacked" className="roof-logo text-foreground" />
    </div>
  );
}

/** One navbar link: champagne dot when active, an underline that slides in on hover. */
function NavItem({
  link,
  active,
  order,
  className,
}: {
  link: NavLink;
  active: boolean;
  order: number;
  className?: string;
}) {
  return (
    <li data-nav-enter style={{ "--nav-i": order } as React.CSSProperties} className={className}>
      <Link
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex flex-col items-center rounded-full px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 xl:px-4",
          active ? "text-foreground" : "text-foreground/70 hover:text-foreground",
        )}
      >
        <span className="relative">
          {link.label}
          {!active && (
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
            />
          )}
        </span>
        {active && (
          <m.span
            layoutId="nav-active-dot"
            aria-hidden
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="absolute bottom-0.5 size-1 rounded-full bg-gold"
          />
        )}
      </Link>
    </li>
  );
}

/** 1024–1279 px: About and Contact fold into this so nothing crowds the peak. */
function MoreMenu({ pathname, order }: { pathname: string; order: number }) {
  const active = SECONDARY_NAV_LINKS.some((link) => isActiveLink(pathname, link.href));
  return (
    <li data-nav-enter style={{ "--nav-i": order } as React.CSSProperties} className="xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            active ? "text-foreground" : "text-foreground/70 hover:text-foreground",
          )}
        >
          More <ChevronDown className="size-3.5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-44 rounded-2xl">
          {SECONDARY_NAV_LINKS.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

/** Right end of the bar: search and Sign in, or search, Dashboard, bell, theme and the avatar menu. */
function AccountCluster({ order, onSearchOpenChange }: { order: number; onSearchOpenChange: (open: boolean) => void }) {
  const { user, isLoading } = useAuth();
  return (
    <div data-nav-enter style={{ "--nav-i": order } as React.CSSProperties} className="flex items-center gap-1.5">
      {isLoading ? (
        <Skeleton className="h-10 w-28 rounded-full" />
      ) : user ? (
        <>
          <NavSearch onOpenChange={onSearchOpenChange} />
          {/* Icon only between 1024 and 1279 px, where the bar is tight. */}
          <Button asChild variant="outline" size="sm" className="h-9 max-xl:w-9 max-xl:px-0 xl:px-3.5">
            <Link href={roleHome(user.role)}>
              <LayoutDashboard className="xl:hidden" aria-hidden />
              <span className="max-xl:sr-only">Dashboard</span>
            </Link>
          </Button>
          <NotificationsMenu role={user.role} />
          <ThemeToggle />
          <UserMenu user={user} />
        </>
      ) : (
        <>
          <NavSearch onOpenChange={onSearchOpenChange} />
          <ThemeToggle />
          <Button asChild variant="gold" size="sm" className="h-9 px-4">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </>
      )}
    </div>
  );
}

function DesktopRoofNav({
  pathname,
  onSearchOpenChange,
}: {
  pathname: string;
  onSearchOpenChange: (open: boolean) => void;
}) {
  const rightStart = PRIMARY_NAV_LINKS.length;
  return (
    <div className={DESKTOP} style={{ height: ROOF_HEIGHT }}>
      <RoofBar />
      <nav aria-label="Primary" className={cn("absolute inset-x-0 bottom-0 grid h-20 items-center px-3 xl:px-4", COLUMNS)}>
        <ul className="flex items-center gap-0.5 xl:gap-1">
          {PRIMARY_NAV_LINKS.map((link, index) => (
            <NavItem key={link.href} link={link} active={isActiveLink(pathname, link.href)} order={index} />
          ))}
        </ul>
        {/* The peak's column stays empty; PeakLogo is drawn over it. */}
        <span aria-hidden />
        <div className="flex items-center justify-end gap-2 xl:gap-3">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {SECONDARY_NAV_LINKS.map((link, index) => (
              <NavItem
                key={link.href}
                link={link}
                active={isActiveLink(pathname, link.href)}
                order={rightStart + index}
                className="hidden xl:block"
              />
            ))}
            <MoreMenu pathname={pathname} order={rightStart} />
          </ul>
          <AccountCluster order={rightStart + SECONDARY_NAV_LINKS.length} onSearchOpenChange={onSearchOpenChange} />
        </div>
      </nav>
      <PeakLogo />
    </div>
  );
}

/**
 * Shown while SiteHeader streams in on dynamic routes (it reads the pathname,
 * which isn't known when those pages are prerendered). Same frame and size.
 */
export function SiteHeaderFallback() {
  return (
    <header className={cn(SHELL, "group/header")}>
      <div className={DESKTOP} style={{ height: ROOF_HEIGHT }}>
        <RoofBar />
        <PeakLogo />
      </div>
      <div className={MOBILE_BAR}>
        <BrandLogo variant="stacked" size="sm" />
      </div>
    </header>
  );
}

/**
 * The public navbar: a glass bar with a gabled peak holding the logo, links
 * split either side (desktop), or a compact bar with a full-screen menu
 * (under 1024 px). Hides while scrolling down, returns on scroll up, and
 * firms up its fill once the page has scrolled.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(40);
  const hiddenByScroll = useHideOnScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hidden = hiddenByScroll && !menuOpen && !searchOpen;

  return (
    <>
      <SkipLink />
      <header
        data-scrolled={scrolled ? "" : undefined}
        className={cn(
          SHELL,
          // Keyboard focus inside keeps it on screen; a link that merely
          // kept focus after a click must not stop it hiding.
          "group/header transition-transform duration-500 ease-out has-focus-visible:translate-y-0",
          hidden && "-translate-y-[calc(100%+1.5rem)]",
        )}
      >
        <DesktopRoofNav pathname={pathname} onSearchOpenChange={setSearchOpen} />
        <div className={MOBILE_BAR}>
          <BrandLogo variant="stacked" size="sm" />
          <div className="flex items-center gap-1">
            <NavSearch className="size-11" onOpenChange={setSearchOpen} />
            <MobileNav open={menuOpen} onOpenChange={setMenuOpen} />
          </div>
        </div>
      </header>
    </>
  );
}
