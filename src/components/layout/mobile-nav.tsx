"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, LayoutDashboard, LogOut, UserRound, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { BrandLogo } from "@/components/brand/brand-logo";
import { setSmoothScrollPaused } from "@/components/motion/smooth-scroll-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { siteSettingsService } from "@/lib/api/site-settings";
import { roleHome } from "@/lib/auth";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import {
  isActiveLink,
  PRIMARY_NAV_LINKS,
  profilePath,
  roleShortcut,
  SECONDARY_NAV_LINKS,
  type NavLink,
} from "@/lib/navigation";
import { queryKeys } from "@/lib/query-keys";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** A big numbered row; several links share one row (About · Contact), a size smaller on phones so it fits. */
function MenuRow({ number, links, pathname }: { number: number; links: NavLink[]; pathname: string }) {
  const size = links.length > 1 ? "text-4xl sm:text-6xl" : "text-5xl sm:text-6xl";
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-8 shrink-0 text-xs font-medium tracking-[0.2em] text-muted-foreground tabular-nums">
        {String(number).padStart(2, "0")}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-3">
        {links.map((link, index) => {
          const active = isActiveLink(pathname, link.href);
          return (
            <span key={link.href} className="flex items-baseline gap-3">
              {index > 0 && (
                <span aria-hidden className={cn("font-serif leading-none text-muted-foreground", size)}>
                  ·
                </span>
              )}
              <DialogPrimitive.Close asChild>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-2xl font-serif leading-none font-normal tracking-[-0.02em] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    size,
                    active ? "text-bronze" : "hover:text-bronze",
                  )}
                >
                  {link.label}
                </Link>
              </DialogPrimitive.Close>
            </span>
          );
        })}
      </span>
    </div>
  );
}

/** The first hero home from the homepage settings; nothing if there isn't one. */
function FeaturedHome({ enabled }: { enabled: boolean }) {
  const homepage = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: siteSettingsService.getHomepage,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const property = homepage.data?.hero.properties.find((item) => item.images.length > 0);
  if (!property) return null;

  return (
    <DialogPrimitive.Close asChild>
      <Link
        href={`/properties/${property.id}`}
        className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
          <Image src={property.images[0]} alt="" fill sizes="80px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-xs font-medium tracking-[0.2em] text-bronze uppercase">Featured home</span>
          <span className="mt-1 block truncate font-medium">{property.title}</span>
          <span className="block truncate text-sm text-muted-foreground">
            {formatCurrency(property.rentAmount)}/mo · {formatLocation(property.city, property.division)}
          </span>
        </span>
        <ArrowUpRight
          className="mr-2 size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </Link>
    </DialogPrimitive.Close>
  );
}

/**
 * The navbar under 1024 px: a "Menu" button that opens a full-screen panel
 * with big numbered links, a featured home, the theme toggle and account
 * actions. Radix traps focus, closes on Esc, returns focus to the button
 * and locks page scroll; Lenis is paused while it's open.
 */
export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const reduceMotion = useReducedMotion();

  // Following a link (or the browser's back button) closes the panel.
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    setSmoothScrollPaused(open);
    return () => setSmoothScrollPaused(false);
  }, [open]);

  const shortcut = user ? roleShortcut(user.role) : null;
  const rows: NavLink[][] = [
    ...PRIMARY_NAV_LINKS.map((link) => [link]),
    SECONDARY_NAV_LINKS,
    ...(shortcut ? [[shortcut]] : []),
  ];

  const item = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.08 + index * 0.06 },
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger className="flex min-h-11 items-center gap-2.5 rounded-full pl-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="hidden min-[480px]:inline">Menu</span>
        <span className="grid size-11 place-items-center rounded-full bg-gold text-gold-foreground">
          <span aria-hidden className="flex w-4.5 flex-col gap-1.5">
            <span className="h-[1.5px] w-full bg-current" />
            <span className="h-[1.5px] w-3/5 self-end bg-current" />
          </span>
        </span>
        <span className="sr-only min-[480px]:hidden">Menu</span>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          data-lenis-prevent
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-background text-foreground duration-300 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Site navigation</DialogPrimitive.Description>

          {/* Mirrors the compact bar so the logo and button don't jump. */}
          <div className="px-4 pt-3.5 sm:px-6">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border pr-1.5 pl-5">
              <BrandLogo variant="stacked" size="sm" />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu" className="size-11 rounded-full">
                  <X />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl flex-1 px-6 pt-10 pb-8 sm:px-10">
            <ul className="space-y-3">
              {rows.map((links, index) => (
                <motion.li key={links[0].href} {...item(index)}>
                  <MenuRow number={index + 1} links={links} pathname={pathname} />
                </motion.li>
              ))}
            </ul>
            <motion.div {...item(rows.length)} className="mt-10">
              <FeaturedHome enabled={open} />
            </motion.div>
          </nav>

          <motion.div {...item(rows.length + 1)} className="mx-auto w-full max-w-6xl space-y-3 px-6 pb-8 sm:px-10">
            <div className="flex items-center justify-between rounded-3xl border border-border bg-card py-2 pr-2 pl-5">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle className="size-11" />
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
                  <UserAvatar name={user.name} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline">{formatEnumLabel(user.role)}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <DialogPrimitive.Close asChild>
                    <Button size="lg" asChild>
                      <Link href={roleHome(user.role)}>
                        <LayoutDashboard data-icon="inline-start" /> Dashboard
                      </Link>
                    </Button>
                  </DialogPrimitive.Close>
                  <DialogPrimitive.Close asChild>
                    <Button variant="outline" size="lg" asChild>
                      <Link href={profilePath(user.role)}>
                        <UserRound data-icon="inline-start" /> Profile
                      </Link>
                    </Button>
                  </DialogPrimitive.Close>
                </div>
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" size="lg" className="w-full" onClick={logout}>
                    <LogOut data-icon="inline-start" /> Log out
                  </Button>
                </DialogPrimitive.Close>
              </>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <DialogPrimitive.Close asChild>
                  <Button variant="gold" size="lg" asChild>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </DialogPrimitive.Close>
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/auth/register">Get started</Link>
                  </Button>
                </DialogPrimitive.Close>
              </div>
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
