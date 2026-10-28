"use client";

import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Building2,
  ClipboardList,
  Hourglass,
  KeyRound,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RoleBadge } from "@/components/dashboard/user-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRentals, useAdminStats, useAdminUsers } from "@/hooks/use-admin";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const RECENT = { limit: 5, sortBy: "createdAt", sortOrder: "desc" } as const;

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={href}>
            View all <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-12 rounded-2xl" />
      ))}
    </div>
  );
}

export function AdminOverview() {
  const stats = useAdminStats();
  const users = useAdminUsers(RECENT);
  const rentals = useAdminRentals(RECENT);
  const { totals } = stats;

  const cards = [
    { label: "Total users", value: totals.users, icon: Users },
    { label: "Tenants", value: totals.tenants, icon: UserRound },
    { label: "Landlords", value: totals.landlords, icon: KeyRound },
    { label: "Banned users", value: totals.blocked, icon: Ban, hint: "Can't log in until unbanned" },
    { label: "Properties", value: totals.properties, icon: Building2 },
    { label: "Pending requests", value: totals.pending, icon: Hourglass, hint: "Waiting on landlords" },
    { label: "Active rentals", value: totals.active, icon: ClipboardList, hint: "Paid and in progress" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Platform overview" description="Everyone and everything on RentNest, live." />

      {stats.error ? (
        <QueryError error={stats.error} onRetry={stats.refetch} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={formatNumber(card.value)}
              icon={card.icon}
              hint={card.hint}
              isLoading={stats.isPending}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Recent users" href="/dashboard/admin/users">
          {users.isError ? (
            <QueryError error={users.error} onRetry={() => void users.refetch()} />
          ) : users.isPending ? (
            <ListSkeleton />
          ) : users.data.data.length === 0 ? (
            <EmptyState icon={Users} title="No users yet" description="New sign-ups will appear here." />
          ) : (
            <ul className="divide-y">
              {users.data.data.map((user) => (
                <li key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <UserAvatar name={user.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email} · joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <RoleBadge role={user.role} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent rentals" href="/dashboard/admin/rentals">
          {rentals.isError ? (
            <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
          ) : rentals.isPending ? (
            <ListSkeleton />
          ) : rentals.data.data.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No rentals yet" description="Rental requests will appear here." />
          ) : (
            <ul className="divide-y">
              {rentals.data.data.map((rental) => (
                <li key={rental.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{rental.property.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {rental.tenant.name} → {rental.property.owner.name} · {formatCurrency(rental.totalRent)}
                    </p>
                  </div>
                  <StatusBadge status={rental.bookingStatus} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
