"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-auth";
import { roleHome } from "@/lib/auth";
import { formatEnumLabel } from "@/lib/format";
import { profilePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

export function UserMenu({ user, onDark = false }: { user: User; onDark?: boolean }) {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "rounded-full ring-1 outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50",
          onDark ? "ring-white/40" : "ring-border",
        )}
      >
        <UserAvatar name={user.name} className="size-10" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl">
        <DropdownMenuLabel className="flex flex-col items-start gap-1 font-normal">
          <span className="w-full truncate font-medium text-foreground">{user.name}</span>
          <span className="w-full truncate text-xs text-muted-foreground">{user.email}</span>
          <Badge variant="secondary" className="mt-1">
            {formatEnumLabel(user.role)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={roleHome(user.role)}>
            <LayoutDashboard aria-hidden /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={profilePath(user.role)}>
            <UserRound aria-hidden /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut aria-hidden /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
