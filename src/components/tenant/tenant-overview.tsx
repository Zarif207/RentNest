"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, ClipboardList, Hourglass, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMyPayments } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH, useMyRentals } from "@/hooks/use-rentals";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const RECENT_COUNT = 5;

export function TenantOverview() {
  const { user } = useAuth();
  const rentals = useMyRentals();
  const payments = useMyPayments();

  const list = rentals.data ?? [];
  const count = (status: string) => list.filter((rental) => rental.bookingStatus === status).length;
  const totalPaid = (payments.data ?? [])
    .filter((payment) => payment.paymentStatus === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : <Skeleton className="h-9 w-64" />}
        description="Your rental requests and payments at a glance."
        actions={
          <Button asChild>
            <Link href="/properties">
              Browse properties <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={formatNumber(list.length)}
          icon={ClipboardList}
          isLoading={rentals.isPending}
        />
        <StatCard
          label="Pending"
          value={formatNumber(count("PENDING"))}
          icon={Hourglass}
          hint="Waiting for the landlord"
          isLoading={rentals.isPending}
        />
        <StatCard
          label="Active rentals"
          value={formatNumber(count("ACTIVE"))}
          icon={KeyRound}
          hint="Paid and moved in"
          isLoading={rentals.isPending}
        />
        <StatCard
          label="Total paid"
          value={payments.isError ? "—" : formatCurrency(totalPaid)}
          icon={CircleDollarSign}
          hint="Successful Stripe payments"
          isLoading={payments.isPending}
        />
      </div>

      <section className="min-w-0 space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent requests</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={TENANT_REQUESTS_PATH}>
              View all <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        {rentals.isError ? (
          <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
        ) : rentals.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requests yet"
            description="Find a home you like and request to rent it. Your requests will appear here."
            action={
              <Button asChild>
                <Link href="/properties">Browse properties</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y">
            {list.slice(0, RECENT_COUNT).map((rental) => (
              <li key={rental.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <PropertyCell property={rental.property} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Move-in {formatDate(rental.moveInDate)}
                </p>
                <StatusBadge status={rental.bookingStatus} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
