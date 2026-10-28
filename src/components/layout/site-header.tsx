"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useScrolled } from "@/hooks/use-scrolled";
import { isActiveLink, PUBLIC_NAV_LINKS, roleShortcut } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Shown while SiteHeader streams in on dynamic routes (it reads the pathname,
 * which isn't known when those pages are prerendered). Same height and frame.
 */
export function SiteHeaderFallback() {
  return (
    <>
      <div aria-hidden className="h-16" />
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
        </div>
      </header>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const { user, isLoading } = useAuth();

  // The home hero runs underneath the header, so it starts transparent there.
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  const shortcut = user ? roleShortcut(user.role) : null;
  const links = shortcut ? [...PUBLIC_NAV_LINKS, shortcut] : PUBLIC_NAV_LINKS;

  return (
    <>
      {/* Reserves the header's height on pages without a full-bleed hero. */}
      {!isHome && <div aria-hidden className="h-16" />}

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          solid
            ? "border-border bg-background/80 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Logo className="justify-self-start" />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const active = isActiveLink(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        active ? "bg-foreground/5 text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 justify-self-end">
            <ThemeToggle />
            <div className="hidden md:block">
              {isLoading ? (
                <Skeleton className="size-9 rounded-full" />
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <Button asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
              )}
            </div>
            <MobileNav links={links} user={user} />
          </div>
        </div>
      </header>
    </>
  );
}
