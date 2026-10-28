"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout } from "@/hooks/use-auth";
import { roleHome } from "@/lib/auth";
import { formatEnumLabel } from "@/lib/format";
import { isActiveLink, profilePath, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type MobileNavProps = {
  links: NavLink[];
  user: User | null;
};

export function MobileNav({ links, user }: MobileNavProps) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const active = isActiveLink(pathname, link.href);
              return (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-lg font-medium transition-colors hover:bg-secondary",
                        active && "bg-secondary",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3 border-t p-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
                <UserAvatar name={user.name} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline">{formatEnumLabel(user.role)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link href={roleHome(user.role)}>
                      <LayoutDashboard data-icon="inline-start" /> Dashboard
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link href={profilePath(user.role)}>
                      <UserRound data-icon="inline-start" /> Profile
                    </Link>
                  </Button>
                </SheetClose>
              </div>
              <SheetClose asChild>
                <Button className="w-full" onClick={logout}>
                  <LogOut data-icon="inline-start" /> Log out
                </Button>
              </SheetClose>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Button variant="outline" asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
