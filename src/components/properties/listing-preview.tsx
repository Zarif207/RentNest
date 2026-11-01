"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Pencil, SearchX } from "lucide-react";
import { ListingReviewButtons, useListingReview } from "@/components/admin/listing-review";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { ReviewStatusBadge } from "@/components/dashboard/review-status-badge";
import { AmenityChip } from "@/components/properties/details/amenity-chip";
import { PropertyGallery } from "@/components/properties/details/property-gallery";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useProperty } from "@/hooks/use-landlord-properties";
import { isApiError } from "@/lib/api/client";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
import { availabilityLabel, LISTING_LABELS, listingPriceLabel, listingSummary } from "@/lib/listing";
import { formatLocation } from "@/lib/us-states";
import type { PropertyWithRelations } from "@/types";

type Viewer = "ADMIN" | "LANDLORD";

const BACK: Record<Viewer, { href: string; label: string }> = {
  ADMIN: { href: "/dashboard/admin/properties", label: "Back to properties" },
  LANDLORD: { href: "/dashboard/landlord/properties", label: "Back to my properties" },
};

/** What the review means for this listing, above the preview. */
function ReviewNotice({ property, viewer }: { property: PropertyWithRelations; viewer: Viewer }) {
  if (property.reviewStatus === "APPROVED") {
    return (
      <p role="status" className="rounded-3xl border border-border bg-card px-5 py-4 text-sm">
        This listing is live.{" "}
        <a href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
          Open the public page
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    );
  }
  if (property.reviewStatus === "REJECTED") {
    return (
      <div role="status" className="space-y-1 rounded-3xl border border-destructive/25 bg-destructive/5 px-5 py-4 text-sm">
        <p className="font-medium">
          {viewer === "ADMIN" ? "Rejected. The landlord was asked to fix:" : "An admin asked you to fix:"}
        </p>
        <p className="whitespace-pre-line text-muted-foreground">{property.reviewNote ?? "No reason was given."}</p>
      </div>
    );
  }
  return (
    <p role="status" className="rounded-3xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm">
      {viewer === "ADMIN"
        ? "Waiting for review. Only you, other admins and the owner can see this page until it's approved."
        : "Waiting for an admin to review it. Renters and buyers will see it once it's approved."}
    </p>
  );
}

/**
 * A listing as the public page will show it, for admins deciding on it and
 * for owners. The public route 404s until a listing is approved; this one
 * reads it with the signed-in user's token, which the API allows for its
 * owner and for admins.
 */
export function ListingPreview({ propertyId, viewer }: { propertyId: string; viewer: Viewer }) {
  const { user } = useAuth();
  const property = useProperty(propertyId);
  const review = useListingReview();
  const back = BACK[viewer];

  if (property.isPending || !user) {
    return (
      <div className="space-y-6" aria-busy="true">
        <span className="sr-only">Loading listing…</span>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="aspect-video max-h-[28rem] w-full rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    );
  }

  const missing = property.isError && isApiError(property.error) && [400, 404].includes(property.error.status);
  if (property.isError && !missing) {
    return <QueryError error={property.error} onRetry={() => void property.refetch()} />;
  }
  if (missing || !property.data || (viewer === "LANDLORD" && property.data.ownerId !== user.id)) {
    return (
      <EmptyState
        icon={SearchX}
        title="Listing not found"
        description="It may have been deleted, or it belongs to someone else."
        action={
          <Button asChild variant="outline">
            <Link href={back.href}>{back.label}</Link>
          </Button>
        }
        className="bg-card"
      />
    );
  }

  const listing = property.data;
  const details = [
    { label: "Property type", value: formatEnumLabel(listing.propertyType) },
    { label: "Category", value: listing.category?.name ?? "Uncategorized" },
    { label: "Bedrooms", value: formatNumber(listing.bedrooms) },
    { label: "Bathrooms", value: formatNumber(listing.bathrooms) },
    { label: "Area", value: `${formatNumber(listing.area)} sq ft` },
    { label: "Availability", value: availabilityLabel(listing.availabilityStatus) },
    { label: "Listed", value: formatDate(listing.createdAt) },
    { label: "Owner", value: `${listing.owner.name} · ${listing.owner.email}` },
  ];

  return (
    <div className="space-y-6">
      <Link
        href={back.href}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> {back.label}
      </Link>

      <PageHeader
        title={listing.title}
        description={`Preview · ${formatLocation(listing.city, listing.division)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {viewer === "ADMIN" ? (
              <ListingReviewButtons property={listing} review={review} size="default" />
            ) : (
              <Button asChild variant={listing.reviewStatus === "REJECTED" ? "default" : "outline"}>
                <Link href={`${back.href}/${listing.id}/edit`}>
                  <Pencil data-icon="inline-start" />
                  {listing.reviewStatus === "REJECTED" ? "Edit and resubmit" : "Edit"}
                </Link>
              </Button>
            )}
            {listing.reviewStatus === "APPROVED" && (
              <Button asChild variant="outline">
                <a href={`/properties/${listing.id}`} target="_blank" rel="noopener noreferrer">
                  Public page <ExternalLink data-icon="inline-end" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            )}
          </div>
        }
      />

      <ReviewNotice property={listing} viewer={viewer} />

      <div className="flex flex-wrap items-center gap-2">
        <ReviewStatusBadge status={listing.reviewStatus} />
        <Badge>{LISTING_LABELS[listing.listingType]}</Badge>
        <Badge variant="gold">{formatEnumLabel(listing.propertyType)}</Badge>
        <span className="ml-auto text-2xl font-semibold tracking-tight">{listingPriceLabel(listing)}</span>
      </div>

      <PropertyGallery images={listing.images} title={listing.title} summary={listingSummary(listing)} />

      <section aria-labelledby="preview-about" className="space-y-5 rounded-3xl border border-border bg-card p-5 sm:p-8">
        <h2 id="preview-about" className="text-2xl font-medium tracking-tight">
          About this home
        </h2>
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {listing.address}, {formatLocation(listing.city, listing.division)}
        </p>
        <p className="max-w-3xl leading-relaxed whitespace-pre-line text-muted-foreground">{listing.description}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border pt-5 sm:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <dt className="text-xs tracking-[0.15em] text-muted-foreground uppercase">{detail.label}</dt>
              <dd className="mt-1.5 font-medium break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="preview-amenities" className="space-y-5 rounded-3xl border border-border bg-card p-5 sm:p-8">
        <h2 id="preview-amenities" className="text-2xl font-medium tracking-tight">
          Amenities
        </h2>
        {listing.amenities.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {listing.amenities.map((amenity) => (
              <AmenityChip key={amenity} amenity={amenity} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No amenities listed.</p>
        )}
      </section>

      {review.dialog}
    </div>
  );
}
