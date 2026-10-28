"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CircleDollarSign,
  Hourglass,
  Inbox,
  KeyRound,
  Plus,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EarningsChart, monthlyEarnings } from "@/components/landlord/earnings-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LANDLORD_PROPERTIES_PATH, useAllLandlordProperties } from "@/hooks/use-landlord-properties";
import { useDecideRequest, useLandlordRequests } from "@/hooks/use-landlord-requests";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { LandlordBooking } from "@/types";

const REQUESTS_PATH = "/dashboard/landlord/requests";
const RECENT_COUNT = 5;

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LandlordOverview() {
  const { user } = useAuth();
  const properties = useAllLandlordProperties();
  const requests = useLandlordRequests();
  const decide = useDecideRequest();
  const [rejecting, setRejecting] = useState<LandlordBooking | null>(null);

  const propertyList = properties.data?.data ?? [];
  const requestList = requests.data ?? [];
  const available = propertyList.filter((p) => p.availabilityStatus === "AVAILABLE").length;
  const count = (status: string) => requestList.filter((r) => r.bookingStatus === status).length;
  // Full lease value of every paid-for rental (ACTIVE) and finished one (COMPLETED).
  const earnings = requestList
    .filter((r) => r.bookingStatus === "ACTIVE" || r.bookingStatus === "COMPLETED")
    .reduce((sum, r) => sum + Number(r.totalRent), 0);
  const chartData = monthlyEarnings(requestList);

  return (
    <div className="space-y-8">
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : <Skeleton className="h-9 w-64" />}
        description="Your listings, requests and earnings at a glance."
        actions={
          <Button asChild>
            <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
              <Plus data-icon="inline-start" /> Add property
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total properties"
          value={formatNumber(properties.data?.meta.total)}
          icon={Building2}
          isLoading={properties.isPending}
        />
        <StatCard
          label="Available / rented"
          value={`${available} / ${propertyList.length - available}`}
          icon={KeyRound}
          hint="Listed as available vs rented"
          isLoading={properties.isPending}
        />
        <StatCard
          label="Pending requests"
          value={formatNumber(count("PENDING"))}
          icon={Hourglass}
          hint="Waiting for your decision"
          isLoading={requests.isPending}
        />
        <StatCard
          label="Active rentals"
          value={formatNumber(count("ACTIVE"))}
          icon={Inbox}
          hint="Paid and in progress"
          isLoading={requests.isPending}
        />
        <StatCard
          label="Total earnings"
          value={formatCurrency(earnings)}
          icon={CircleDollarSign}
          hint="Lease value of active + completed rentals"
          isLoading={requests.isPending}
        />
      </div>

      {requests.isError ? (
        <QueryError error={requests.error} onRetry={() => void requests.refetch()} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <Panel title="Earnings by month">
            {requests.isPending ? (
              <Skeleton className="h-56 rounded-2xl" />
            ) : chartData.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No earnings yet"
                description="Earnings appear once a tenant pays for an approved request."
                action={
                  <Button asChild variant="outline">
                    <Link href={REQUESTS_PATH}>Review requests</Link>
                  </Button>
                }
              />
            ) : (
              <EarningsChart data={chartData} />
            )}
          </Panel>

          <Panel
            title="Recent requests"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href={REQUESTS_PATH}>
                  View all <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            }
          >
            {requests.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : requestList.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No requests yet"
                description="When tenants request your homes, they'll show up here."
                action={
                  <Button asChild variant="outline">
                    <Link href={LANDLORD_PROPERTIES_PATH}>Manage properties</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {requestList.slice(0, RECENT_COUNT).map((request) => (
                  <li key={request.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <PropertyCell property={request.property} />
                      <StatusBadge status={request.bookingStatus} />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-muted-foreground">
                        {request.tenant.name} · from {formatDate(request.moveInDate)} ·{" "}
                        {formatCurrency(request.totalRent)}
                      </p>
                      {request.bookingStatus === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            disabled={decide.isPending}
                            onClick={() => decide.mutate({ id: request.id, status: "APPROVED" })}
                          >
                            <Check /> Approve
                          </Button>
                          <Button size="xs" variant="outline" disabled={decide.isPending} onClick={() => setRejecting(request)}>
                            <X /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this request?"
        description={
          <>
            {rejecting?.tenant.name}&apos;s request for <strong>{rejecting?.property.title}</strong> will be
            rejected.
          </>
        }
        confirmLabel="Reject request"
        destructive
        onConfirm={() => {
          if (rejecting) decide.mutate({ id: rejecting.id, status: "REJECTED" });
          setRejecting(null);
        }}
      />
    </div>
  );
}
