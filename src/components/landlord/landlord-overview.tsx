"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Building2, Check, Hourglass, House, Inbox, KeyRound, Plus, Star, X } from "lucide-react";
import { BentoCard, BentoGrid, MetricCard, ProgressPair } from "@/components/dashboard/bento";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusPill } from "@/components/dashboard/status-badge";
import { EarningsChart, monthlyEarnings } from "@/components/landlord/earnings-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  LANDLORD_PROPERTIES_PATH,
  useAllLandlordProperties,
  useToggleAvailability,
} from "@/hooks/use-landlord-properties";
import { useLandlordReviews } from "@/hooks/use-landlord-reviews";
import { useDecideRequest, useLandlordRequests } from "@/hooks/use-landlord-requests";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import type { LandlordBooking, PropertyWithRelations } from "@/types";

const REQUESTS_PATH = "/dashboard/landlord/requests";
const REQUEST_COUNT = 4;
const OBJECT_COUNT = 3;

/** Mini listing card: photo, status chip, price and a quick availability switch. */
function PropertyObject({ property }: { property: PropertyWithRelations }) {
  const toggle = useToggleAvailability();
  const available = property.availabilityStatus === "AVAILABLE";
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-foreground/3 p-2">
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        {property.images[0] ? (
          <Image src={property.images[0]} alt="" fill sizes="(min-width: 1024px) 18vw, 50vw" className="object-cover" />
        ) : (
          <House className="m-auto h-full size-8 text-muted-foreground" aria-hidden />
        )}
        <span
          className={cn(
            "absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md",
            available ? "bg-background/85" : "bg-foreground/80 text-background",
          )}
        >
          {available ? "Available" : "Rented"}
        </span>
        <Link
          href={`${LANDLORD_PROPERTIES_PATH}/${property.id}/edit`}
          aria-label={`Edit ${property.title}`}
          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="space-y-1 px-2 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{property.title}</p>
          <p className="shrink-0 text-sm font-semibold">{formatCurrency(property.rentAmount)}</p>
        </div>
        <p className="truncate text-xs text-muted-foreground">{formatLocation(property.city, property.division)}</p>
        <label className="flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          Listed as available
          <Switch
            checked={available}
            disabled={toggle.isPending}
            onCheckedChange={(checked) => toggle.mutate({ id: property.id, status: checked ? "AVAILABLE" : "RENTED" })}
            aria-label={`${property.title} is available`}
          />
        </label>
      </div>
    </li>
  );
}

export function LandlordOverview() {
  const { user } = useAuth();
  const properties = useAllLandlordProperties();
  const requests = useLandlordRequests();
  const reviews = useLandlordReviews();
  const decide = useDecideRequest();
  const [rejecting, setRejecting] = useState<LandlordBooking | null>(null);

  const propertyList = properties.data?.data ?? [];
  const requestList = requests.data ?? [];
  const reviewList = reviews.data?.data ?? [];
  const available = propertyList.filter((p) => p.availabilityStatus === "AVAILABLE").length;
  const count = (status: string) => requestList.filter((r) => r.bookingStatus === status).length;
  // Full lease value of every paid-for rental (ACTIVE) and finished one (COMPLETED).
  const earnings = requestList
    .filter((r) => r.bookingStatus === "ACTIVE" || r.bookingStatus === "COMPLETED")
    .reduce((sum, r) => sum + Number(r.totalRent), 0);
  const averageRating = reviewList.length
    ? reviewList.reduce((sum, review) => sum + review.rating, 0) / reviewList.length
    : null;
  const chartData = monthlyEarnings(requestList);
  // Pending requests first (they need a decision), then the newest.
  const incoming = [...requestList]
    .sort((a, b) => Number(b.bookingStatus === "PENDING") - Number(a.bookingStatus === "PENDING") || b.createdAt.localeCompare(a.createdAt))
    .slice(0, REQUEST_COUNT);

  return (
    <div className="space-y-6">
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : <Skeleton className="h-10 w-64" />}
        description="Your listings, requests and earnings at a glance."
        actions={
          <Button asChild>
            <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
              <Plus data-icon="inline-start" /> Add property
            </Link>
          </Button>
        }
      />

      <BentoGrid>
        <BentoCard className="justify-between gap-8 md:col-span-6 lg:col-span-5">
          <div>
            <p className="text-sm text-muted-foreground">Total earnings</p>
            {requests.isPending ? (
              <Skeleton className="mt-2 h-14 w-40" />
            ) : (
              <p className="mt-1 font-serif text-6xl leading-none tabular-nums">{formatCurrency(earnings)}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">Full lease value of active and completed rentals</p>
          </div>
          {properties.isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <ProgressPair
              left={{ label: "Available", value: available }}
              right={{ label: "Rented", value: propertyList.length - available }}
            />
          )}
        </BentoCard>

        <BentoCard title="Earnings by month" className="md:col-span-6 lg:col-span-7">
          {requests.isError ? (
            <QueryError error={requests.error} onRetry={() => void requests.refetch()} />
          ) : requests.isPending ? (
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
        </BentoCard>

        <MetricCard
          label="Properties"
          value={formatNumber(properties.data?.meta.total)}
          icon={Building2}
          href={LANDLORD_PROPERTIES_PATH}
          isLoading={properties.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Pending requests"
          value={formatNumber(count("PENDING"))}
          hint="Waiting for your decision"
          icon={Hourglass}
          isLoading={requests.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Active rentals"
          value={formatNumber(count("ACTIVE"))}
          hint="Paid and in progress"
          icon={KeyRound}
          isLoading={requests.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Average rating"
          value={averageRating === null ? "—" : averageRating.toFixed(1)}
          hint={reviewList.length ? `From ${reviewList.length} ${reviewList.length === 1 ? "review" : "reviews"}` : "No reviews yet"}
          icon={Star}
          isLoading={reviews.isPending}
          className="md:col-span-3 lg:col-span-3"
        />

        <BentoCard title="Property objects" href={LANDLORD_PROPERTIES_PATH} className="md:col-span-6 lg:col-span-7">
          {properties.isError ? (
            <QueryError error={properties.error} onRetry={() => void properties.refetch()} />
          ) : properties.isPending ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: OBJECT_COUNT }, (_, index) => (
                <Skeleton key={index} className="h-60 rounded-2xl" />
              ))}
            </div>
          ) : propertyList.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="List your first home: photos, rent and amenities in a few minutes."
              action={
                <Button asChild>
                  <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
                    <Plus data-icon="inline-start" /> Add property
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-3">
              {propertyList.slice(0, OBJECT_COUNT).map((property) => (
                <PropertyObject key={property.id} property={property} />
              ))}
            </ul>
          )}
        </BentoCard>

        <BentoCard title="Incoming requests" href={REQUESTS_PATH} className="md:col-span-6 lg:col-span-5">
          {requests.isError ? (
            <QueryError error={requests.error} onRetry={() => void requests.refetch()} />
          ) : requests.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : incoming.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No requests yet"
              description="When tenants request your homes, they'll show up here."
            />
          ) : (
            <ul className="space-y-2">
              {incoming.map((request) => (
                <li key={request.id} className="space-y-3 rounded-2xl bg-foreground/3 p-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={request.tenant.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{request.tenant.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {request.property.title} · from {formatDate(request.moveInDate)}
                      </p>
                    </div>
                    <StatusPill status={request.bookingStatus} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{formatCurrency(request.totalRent)}</p>
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
        </BentoCard>
      </BentoGrid>

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
