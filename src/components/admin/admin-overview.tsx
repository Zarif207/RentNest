"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Ban,
  Building2,
  CircleCheck,
  ClipboardList,
  Hourglass,
  KeyRound,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BentoCard, BentoGrid, MetricCard, ProgressPair } from "@/components/dashboard/bento";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusPill } from "@/components/dashboard/status-badge";
import { RoleBadge } from "@/components/dashboard/user-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRentals, useAdminStats, useAdminUsers, usePendingLandlords } from "@/hooks/use-admin";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const RECENT = { limit: 5, sortBy: "createdAt", sortOrder: "desc" } as const;
const PENDING_LANDLORDS_PATH = "/dashboard/admin/users?landlordStatus=PENDING";

const QUICK_ACTIONS: { href: string; label: string; description: string; icon: LucideIcon }[] = [
  { href: "/dashboard/admin/users?userStatus=BLOCKED", label: "Banned users", description: "Review and unban", icon: Ban },
  { href: "/dashboard/admin/rentals?status=PENDING", label: "Pending rentals", description: "Waiting on landlords", icon: Hourglass },
  { href: "/dashboard/admin/properties", label: "All listings", description: "Search every property", icon: Building2 },
  { href: "/dashboard/admin/categories", label: "Categories", description: "Add, rename or remove", icon: Tags },
];

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
  const pendingLandlords = usePendingLandlords(3);
  const { totals } = stats;

  const metrics = [
    { label: "Total users", value: totals.users, icon: Users, href: "/dashboard/admin/users" },
    { label: "Tenants", value: totals.tenants, icon: UserRound },
    { label: "Landlords", value: totals.landlords, icon: KeyRound },
    { label: "Banned", value: totals.blocked, icon: Ban, hint: "Can't log in" },
    { label: "Properties", value: totals.properties, icon: Building2, href: "/dashboard/admin/properties" },
    { label: "Pending requests", value: totals.pending, icon: Hourglass, hint: "Waiting on landlords" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description="Everyone and everything on RentNest, live." />

      {stats.error && <QueryError error={stats.error} onRetry={stats.refetch} />}

      <BentoGrid>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={formatNumber(metric.value)}
            icon={metric.href ? undefined : metric.icon}
            href={metric.href}
            hint={metric.hint}
            isLoading={stats.isPending}
            className="md:col-span-2 lg:col-span-2"
          />
        ))}

        <BentoCard title="Users by role" href="/dashboard/admin/users" className="justify-between md:col-span-6 lg:col-span-5">
          {stats.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-3">
              <ProgressPair
                left={{ label: "Tenants", value: totals.tenants ?? 0 }}
                right={{ label: "Landlords", value: totals.landlords ?? 0 }}
                total={totals.users}
              />
              <p className="text-xs text-muted-foreground">
                Hatched: admin accounts. {formatNumber(totals.active)}{" "}
                {totals.active === 1 ? "rental is" : "rentals are"} active right now.
              </p>
            </div>
          )}
        </BentoCard>

        <BentoCard title="Awaiting approval" href={PENDING_LANDLORDS_PATH} className="md:col-span-6 lg:col-span-7">
          {pendingLandlords.isError ? (
            <QueryError error={pendingLandlords.error} onRetry={() => void pendingLandlords.refetch()} />
          ) : pendingLandlords.isPending ? (
            <ListSkeleton />
          ) : pendingLandlords.data.meta.total === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleCheck className="size-4 text-bronze" aria-hidden /> All caught up: no landlords waiting for approval.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="flex items-baseline gap-2">
                <span className="font-serif text-5xl leading-none lining-nums tabular-nums">
                  {formatNumber(pendingLandlords.data.meta.total)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {pendingLandlords.data.meta.total === 1 ? "landlord is" : "landlords are"} waiting for approval
                </span>
              </p>
              <ul className="space-y-1">
                {pendingLandlords.data.data.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={PENDING_LANDLORDS_PATH}
                      className="flex items-center gap-3 rounded-2xl p-2 outline-none transition-colors hover:bg-foreground/3 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <UserAvatar name={user.name} className="size-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email} · signed up {formatDate(user.createdAt)}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-bronze">Review</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </BentoCard>

        <BentoCard title="Quick actions" className="md:col-span-6 lg:col-span-12">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map(({ href, label, description, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl bg-foreground/3 p-3 outline-none transition-colors hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-foreground">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{description}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard title="Latest users" href="/dashboard/admin/users" className="md:col-span-6 lg:col-span-6">
          {users.isError ? (
            <QueryError error={users.error} onRetry={() => void users.refetch()} />
          ) : users.isPending ? (
            <ListSkeleton />
          ) : users.data.data.length === 0 ? (
            <EmptyState icon={Users} title="No users yet" description="New sign-ups will appear here." />
          ) : (
            <ul className="space-y-1">
              {users.data.data.map((user) => (
                <li key={user.id} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-foreground/3">
                  <UserAvatar name={user.name} className="size-10" />
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
        </BentoCard>

        <BentoCard title="Latest rentals" href="/dashboard/admin/rentals" className="md:col-span-6 lg:col-span-6">
          {rentals.isError ? (
            <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
          ) : rentals.isPending ? (
            <ListSkeleton />
          ) : rentals.data.data.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No rentals yet" description="Rental requests will appear here." />
          ) : (
            <ul className="space-y-1">
              {rentals.data.data.map((rental) => (
                <li key={rental.id} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-foreground/3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{rental.property.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {rental.tenant.name} → {rental.property.owner.name} · {formatCurrency(rental.totalRent)}
                    </p>
                  </div>
                  <StatusPill status={rental.bookingStatus} />
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
