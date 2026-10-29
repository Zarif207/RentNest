"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Magnetic } from "@/components/motion/magnetic";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useIsOverDarkHero } from "@/hooks/use-dark-hero";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useScrolled } from "@/hooks/use-scrolled";
import { isActiveLink, PUBLIC_NAV_LINKS, roleShortcut } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Floating pill: 16px from the top, centered. Height 56px, so pages without a
// full-bleed hero reserve 96px (pill + breathing room) with a spacer.
const SHELL = "fixed inset-x-0 top-4 z-50 px-4 sm:px-6";
const PILL = "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border pr-2 pl-5";

/**
 * Shown while SiteHeader streams in on dynamic routes (it reads the pathname,
 * which isn't known when those pages are prerendered). Same frame and size.
 */
export function SiteHeaderFallback() {
  return (
    <>
      <div aria-hidden className="h-24" />
      <header className={SHELL}>
        <div className={cn(PILL, "border-border bg-background/75 backdrop-blur-xl")}>
          <BrandLogo size="sm" />
        </div>
      </header>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const hiddenByScroll = useHideOnScroll();
  const overDarkHero = useIsOverDarkHero();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // The home hero runs underneath the header; other pages get a spacer.
  const isHome = pathname === "/";
  // Light text only while a dark hero is directly behind the transparent pill.
  const onDark = overDarkHero && !scrolled && !menuOpen;
  const hidden = hiddenByScroll && !menuOpen;

  const shortcut = user ? roleShortcut(user.role) : null;
  const links = shortcut ? [...PUBLIC_NAV_LINKS, shortcut] : PUBLIC_NAV_LINKS;

  return (
    <>
      {!isHome && <div aria-hidden className="h-24" />}

      <header
        className={cn(
          SHELL,
          "transition-transform duration-500 ease-out focus-within:translate-y-0",
          hidden && "-translate-y-[calc(100%+1.5rem)]",
        )}
      >
        <div
          className={cn(
            PILL,
            "transition-[background-color,border-color,color,box-shadow] duration-500",
            onDark
              ? "border-white/15 bg-white/10 text-white backdrop-blur-md"
              : scrolled
                ? "border-border bg-background/75 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl"
                : "border-border/70 bg-background/40 text-foreground backdrop-blur-md",
          )}
        >
          <BrandLogo size="sm" className="shrink-0" />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center">
              {links.map((link) => {
                const active = isActiveLink(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex flex-col items-center rounded-full px-4 py-2 text-sm font-medium transition-opacity outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                        active ? "opacity-100" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      <span className="relative">
                        {link.label}
                        {/* Hover underline grows from the left; the active link shows the dot instead. */}
                        {!active && (
                          <span
                            aria-hidden
                            className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"
                          />
                        )}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="nav-active-dot"
                          aria-hidden
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className={cn(
                            "absolute bottom-0.5 size-1 rounded-full",
                            onDark ? "bg-white" : "bg-gold",
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle
              className={cn(onDark && "text-white hover:bg-white/10 hover:text-white")}
            />
            <div className="hidden items-center gap-2 lg:flex">
              {isLoading ? (
                <Skeleton className="size-10 rounded-full" />
              ) : user ? (
                <UserMenu user={user} onDark={onDark} />
              ) : (
                <>
                  <Magnetic strength={0.25}>
                    <Button
                      asChild
                      variant="outline"
                      className={cn(onDark && "border-white/30 text-white hover:border-white/60 hover:bg-white/10")}
                    >
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.25}>
                    <Button asChild variant={onDark ? "gold" : "default"}>
                      <Link href="/auth/register">Get started</Link>
                    </Button>
                  </Magnetic>
                </>
              )}
            </div>
            <MobileNav links={links} user={user} open={menuOpen} onOpenChange={setMenuOpen} onDark={onDark} />
          </div>
        </div>
      </header>
    </>
  );
}
