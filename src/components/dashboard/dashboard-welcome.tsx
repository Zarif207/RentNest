"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import type { UserRole } from "@/types";

/** Greeting and shortcuts to the role's pages (the overview's starting point). */
export function DashboardWelcome({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const shortcuts = DASHBOARD_NAV[role].slice(1);

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          user ? (
            `Welcome back, ${user.name.split(" ")[0]}`
          ) : (
            <Skeleton className="h-9 w-64" />
          )
        }
        description="Here's where you manage everything on RentNest."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-4 rounded-3xl border bg-card p-5 transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-11 place-items-center rounded-full bg-secondary group-hover:bg-background">
                <item.icon className="size-5" aria-hidden />
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
