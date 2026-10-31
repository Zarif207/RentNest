"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Building2,
  Check,
  HandCoins,
  Hourglass,
  House,
  Inbox,
  KeyRound,
  Signpost,
  Star,
  X,
} from "lucide-react";
import { BentoCard, BentoGrid, MetricCard, ProgressPair } from "@/components/dashboard/bento";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusPill } from "@/components/dashboard/status-badge";
import { EarningsChart, monthlyEarnings } from "@/components/landlord/earnings-chart";
import { OfferStatusPill } from "@/components/offers/offer-status-pill";
import { RecentActivityCard } from "@/components/notifications/recent-activity-card";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPropertyButton, ApprovalTooltip } from "@/components/landlord/approval";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  LANDLORD_PROPERTIES_PATH,
  useAllLandlordProperties,
  useToggleAvailability,
} from "@/hooks/use-landlord-properties";
import { useLandlordReviews } from "@/hooks/use-landlord-reviews";
import { useLandlordAccess } from "@/hooks/use-landlord-access";
import { OWNER_OFFERS_PATH, useLandlordOffers } from "@/hooks/use-landlord-offers";
import { useDecideRequest, useLandlordRequests } from "@/hooks/use-landlord-requests";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { availabilityLabel, listingPriceLabel } from "@/lib/listing";
import { isOpenOffer } from "@/lib/offers";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import type { LandlordBooking, PropertyWithRelations } from "@/types";

const REQUESTS_PATH = "/dashboard/landlord/requests";
const REQUEST_COUNT = 4;
const OBJECT_COUNT = 3;

/** Mini listing card: photo, status chip, price and a quick availability switch. */
function PropertyObject({ property }: { property: PropertyWithRelations }) {
  const toggle = useToggleAvailability();
  const { canWrite } = useLandlordAccess();
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
          {availabilityLabel(property.availabilityStatus)}
        </span>
        {canWrite && (
          <Link
            href={`${LANDLORD_PROPERTIES_PATH}/${property.id}/edit`}
            aria-label={`Edit ${property.title}`}
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
          >
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      <div className="space-y-1 px-2 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{property.title}</p>
          <p className="shrink-0 text-sm font-semibold">{listingPriceLabel(property)}</p>
        </div>
        <p className="truncate text-xs text-muted-foreground">{formatLocation(property.city, property.division)}</p>
        {/* Homes for sale change status through their offers, not by hand. */}
        {property.listingType === "SALE" ? (
          <p className="pt-2 text-xs text-muted-foreground">For sale · status set by offers</p>
        ) : (
          <label className="flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
            Listed as available
            <ApprovalTooltip>
              <Switch
                checked={available}
                disabled={toggle.isPending || !canWrite}
                onCheckedChange={(checked) => toggle.mutate({ id: property.id, status: checked ? "AVAILABLE" : "RENTED" })}
                aria-label={`${property.title} is available`}
              />
            </ApprovalTooltip>
          </label>
        )}
      </div>
    </li>
  );
}

export function LandlordOverview() {
  const { user } = useAuth();
  const properties = useAllLandlordProperties();
  const requests = useLandlordRequests();
  const offers = useLandlordOffers();
  const reviews = useLandlordReviews();
  const decide = useDecideRequest();
  const { canWrite } = useLandlordAccess();
  const [rejecting, setRejecting] = useState<LandlordBooking | null>(null);

  const propertyList = properties.data?.data ?? [];
  const requestList = requests.data ?? [];
  const reviewList = reviews.data?.data ?? [];
  const rentals = propertyList.filter((p) => p.listingType === "RENT");
  const available = rentals.filter((p) => p.availabilityStatus === "AVAILABLE").length;
  const offerList = offers.data ?? [];
  const forSale = propertyList.filter((p) => p.listingType === "SALE" && p.availabilityStatus !== "SOLD").length;
  const openOffers = offerList.filter((offer) => isOpenOffer(offer.status)).length;
  const salesCompleted = offerList.filter((offer) => offer.status === "COMPLETED").length;
  // Deposits that came in (paid offers, whether or not the sale has closed yet).
  const depositsReceived = offerList
    .filter((offer) => offer.payment?.paymentStatus === "PAID")
    .reduce((sum, offer) => sum + Number(offer.payment?.amount ?? 0), 0);
  // Offers waiting for an answer first, then the newest.
  const incomingOffers = [...offerList]
    .sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING") || b.createdAt.localeCompare(a.createdAt))
    .slice(0, REQUEST_COUNT);
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
        description="Your listings, requests, offers and earnings at a glance."
        actions={
          <AddPropertyButton />
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
              right={{ label: "Rented", value: rentals.length - available }}
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
                <AddPropertyButton />
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
                      <ApprovalTooltip>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            disabled={decide.isPending || !canWrite}
                            onClick={() => decide.mutate({ id: request.id, status: "APPROVED" })}
                          >
                            <Check /> Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={decide.isPending || !canWrite}
                            onClick={() => setRejecting(request)}
                          >
                            <X /> Reject
                          </Button>
                        </div>
                      </ApprovalTooltip>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        <MetricCard
          label="Homes for sale"
          value={formatNumber(forSale)}
          hint="Listed, not yet sold"
          icon={Signpost}
          isLoading={properties.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Open offers"
          value={offers.isError ? "—" : formatNumber(openOffers)}
          hint="Pending, countered or accepted"
          icon={HandCoins}
          href={OWNER_OFFERS_PATH}
          isLoading={offers.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Sales completed"
          value={offers.isError ? "—" : formatNumber(salesCompleted)}
          hint="Homes marked sold"
          icon={BadgeCheck}
          isLoading={offers.isPending}
          className="md:col-span-3 lg:col-span-3"
        />
        <MetricCard
          label="Deposits received"
          value={offers.isError ? "—" : formatCurrency(depositsReceived)}
          hint="Paid earnest-money deposits"
          icon={Banknote}
          isLoading={offers.isPending}
          className="md:col-span-3 lg:col-span-3"
        />

        <BentoCard title="Incoming offers" href={OWNER_OFFERS_PATH} className="md:col-span-6 lg:col-span-12">
          {offers.isError ? (
            <QueryError error={offers.error} onRetry={() => void offers.refetch()} />
          ) : offers.isPending ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : incomingOffers.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="No offers yet"
              description="List a home for sale and buyers' offers will show up here."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {incomingOffers.map((offer) => (
                <li key={offer.id}>
                  <Link
                    href={OWNER_OFFERS_PATH}
                    className="flex h-full flex-col gap-3 rounded-2xl bg-foreground/3 p-3 transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={offer.buyer.name} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{offer.buyer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{offer.property.title}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{formatCurrency(offer.agreedAmount ?? offer.offerAmount)}</p>
                      <OfferStatusPill status={offer.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        <RecentActivityCard role="LANDLORD" className="md:col-span-6 lg:col-span-12" />
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
