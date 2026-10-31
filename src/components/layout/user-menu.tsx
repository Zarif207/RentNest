"use client";

import Link from "next/link";
import { ClipboardList, LogOut, PlusCircle, UserRound } from "lucide-react";
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
import { formatEnumLabel } from "@/lib/format";
import { profilePath, roleShortcut } from "@/lib/navigation";
import type { User } from "@/types";

/** Avatar dropdown: who's signed in, the role shortcut, Profile and Log out. */
export function UserMenu({ user }: { user: User }) {
  const logout = useLogout();
  const shortcut = roleShortcut(user.role);
  const ShortcutIcon = user.role === "LANDLORD" ? PlusCircle : ClipboardList;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="rounded-full ring-1 ring-border outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50"
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
        {shortcut && (
          <DropdownMenuItem asChild>
            <Link href={shortcut.href}>
              <ShortcutIcon aria-hidden /> {shortcut.label}
            </Link>
          </DropdownMenuItem>
        )}
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
