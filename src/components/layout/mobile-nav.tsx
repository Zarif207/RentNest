"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, UserRound, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { BrandLogo } from "@/components/brand/brand-logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { roleHome } from "@/lib/auth";
import { formatEnumLabel } from "@/lib/format";
import { isActiveLink, profilePath, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type MobileNavProps = {
  links: NavLink[];
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The header pill is over a dark hero, so the trigger is drawn light. */
  onDark: boolean;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Full-screen menu under the lg breakpoint: big links that stagger in, CTAs at the bottom. */
export function MobileNav({ links, user, open, onOpenChange, onDark }: MobileNavProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const reduceMotion = useReducedMotion();

  const item = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.08 + index * 0.06 },
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className={cn("lg:hidden", onDark && "text-white hover:bg-white/10 hover:text-white")}
        >
          <span aria-hidden className="flex w-5 flex-col gap-1.5">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-3/5 self-end bg-current" />
          </span>
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          data-lenis-prevent
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-background text-foreground duration-300 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Site navigation</DialogPrimitive.Description>

          {/* Mirrors the header pill so the logo and close button don't jump. */}
          <div className="px-4 pt-4 sm:px-6">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border pr-2 pl-5">
              {/* BrandLogo is its own link; closing on the bubbled click keeps it simple. */}
              <span onClick={() => onOpenChange(false)}>
                <BrandLogo size="sm" />
              </span>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu">
                  <X />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl flex-1 px-6 pt-12 pb-8 sm:px-10">
            <ul className="space-y-2">
              {links.map((link, index) => {
                const active = isActiveLink(pathname, link.href);
                return (
                  <motion.li key={link.href} {...item(index)}>
                    <DialogPrimitive.Close asChild>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-baseline gap-4 rounded-2xl py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                      >
                        <span className="w-8 text-xs font-medium tracking-[0.2em] text-muted-foreground tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-5xl font-medium tracking-[-0.04em] transition-colors sm:text-6xl",
                            active ? "text-bronze" : "group-hover:text-bronze",
                          )}
                        >
                          {link.label}
                        </span>
                        {active && <span aria-hidden className="size-2 self-center rounded-full bg-gold" />}
                      </Link>
                    </DialogPrimitive.Close>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div
            {...item(links.length)}
            className="mx-auto w-full max-w-6xl space-y-3 px-6 pb-8 sm:px-10"
          >
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
                    <Button variant="outline" size="lg" asChild>
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
                  <Button size="lg" className="w-full" onClick={logout}>
                    <LogOut data-icon="inline-start" /> Log out
                  </Button>
                </DialogPrimitive.Close>
              </>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <DialogPrimitive.Close asChild>
                  <Button size="lg" asChild>
                    <Link href="/auth/register">Get started</Link>
                  </Button>
                </DialogPrimitive.Close>
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/auth/login">Sign in</Link>
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
