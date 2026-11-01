"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Building2, CircleCheck, Eye, ExternalLink, Search, Shapes, Tags, ToggleRight } from "lucide-react";
import { ListingReviewButtons, useListingReview } from "@/components/admin/listing-review";
import { FilterPill } from "@/components/dashboard/bento";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { listingHref, ReviewStatusBadge } from "@/components/dashboard/review-status-badge";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_PROPERTIES_PATH, useAdminProperties, usePendingListingCount } from "@/hooks/use-admin";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
import { availabilityLabel, LISTING_LABELS, listingPriceLabel } from "@/lib/listing";
import {
  AVAILABILITY_STATUSES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  REVIEW_STATUSES,
  type AvailabilityStatus,
  type ListingType,
  type PropertyType,
  type PropertyWithRelations,
  type ReviewStatus,
} from "@/types";

const ANY = "any";
const PAGE_SIZE = 10;

// ?review= picks the tab; without it the Pending tab opens (the work queue).
const ALL_TAB = "ALL";
const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: ALL_TAB, label: "All" },
] as const;

const STATUS_VARIANT = {
  AVAILABLE: "active",
  RENTED: "completed",
  UNDER_CONTRACT: "pending",
  SOLD: "completed",
} as const satisfies Record<AvailabilityStatus, string>;

function readReviewTab(value: string | null): ReviewStatus | typeof ALL_TAB {
  const upper = value?.toUpperCase();
  if (upper === ALL_TAB) return ALL_TAB;
  return REVIEW_STATUSES.find((status) => status === upper) ?? "PENDING";
}

export function AdminPropertiesView() {
  const { searchParams, pathname, setParams } = useUrlParams();
  const review = useListingReview();
  const pendingCount = usePendingListingCount();

  const tab = readReviewTab(searchParams.get("review"));
  const type = searchParams.get("propertyType") as PropertyType | null;
  const availability = searchParams.get("availabilityStatus") as AvailabilityStatus | null;
  const listingType = searchParams.get("listingType") as ListingType | null;
  const page = Number.parseInt(searchParams.get("page") ?? "", 10);
  const query = {
    reviewStatus: tab === ALL_TAB ? undefined : tab,
    searchTerm: searchParams.get("searchTerm")?.trim() || undefined,
    listingType: listingType && LISTING_TYPES.includes(listingType) ? listingType : undefined,
    propertyType: type && PROPERTY_TYPES.includes(type) ? type : undefined,
    availabilityStatus: availability && AVAILABILITY_STATUSES.includes(availability) ? availability : undefined,
    // Oldest first while reviewing, so nobody waits longest; newest first otherwise.
    sortBy: "createdAt" as const,
    sortOrder: tab === "PENDING" ? ("asc" as const) : ("desc" as const),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
  };
  const filtered = Boolean(query.searchTerm || query.listingType || query.propertyType || query.availabilityStatus);

  const properties = useAdminProperties(query);
  const commitSearch = useCallback((value: string) => setParams({ searchTerm: value }), [setParams]);
  // Clears the filters but stays on the tab.
  const clearFilters = () =>
    setParams({ searchTerm: null, listingType: null, propertyType: null, availabilityStatus: null });

  const columns: DataTableColumn<PropertyWithRelations>[] = [
    {
      key: "property",
      header: "Property",
      cell: (property) => <PropertyCell property={property} href={listingHref(property, ADMIN_PROPERTIES_PATH)} />,
      className: "max-w-72",
      hideOnMobile: true,
    },
    {
      key: "owner",
      header: "Owner",
      cell: (property) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{property.owner.name}</p>
          <p className="truncate text-xs text-muted-foreground">{property.owner.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (property) => (
        <span>
          {formatEnumLabel(property.propertyType)}
          <span className="block text-xs text-muted-foreground">{LISTING_LABELS[property.listingType]}</span>
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (property) => <span className="font-semibold">{listingPriceLabel(property)}</span>,
    },
    {
      key: "review",
      header: "Review",
      cell: (property) => (
        <div className="max-w-56 space-y-1">
          <ReviewStatusBadge status={property.reviewStatus} />
          {property.reviewStatus === "REJECTED" && property.reviewNote && (
            <p className="line-clamp-2 text-xs text-muted-foreground" title={property.reviewNote}>
              {property.reviewNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Availability",
      cell: (property) => (
        <Badge variant={STATUS_VARIANT[property.availabilityStatus]}>{availabilityLabel(property.availabilityStatus)}</Badge>
      ),
    },
    { key: "listed", header: "Listed", cell: (property) => formatDate(property.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (property) => (
        // One line on desktop; stacked cards wrap it on phones.
        <div className="flex flex-wrap justify-end gap-2 md:flex-nowrap">
          {property.reviewStatus === "APPROVED" ? (
            <Button asChild size="sm" variant="outline">
              <a href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                View <ExternalLink data-icon="inline-end" />
                <span className="sr-only">{property.title} (opens in a new tab)</span>
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href={`${ADMIN_PROPERTIES_PATH}/${property.id}`}>
                <Eye data-icon="inline-start" /> Preview
                <span className="sr-only"> {property.title}</span>
              </Link>
            </Button>
          )}
          <ListingReviewButtons property={property} review={review} />
        </div>
      ),
    },
  ];

  const toolbar = (
    <>
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <DebouncedInput
          type="search"
          aria-label="Search listings"
          placeholder="Search title, city or address…"
          className="h-10 rounded-full bg-card pl-10"
          value={query.searchTerm ?? ""}
          onCommit={commitSearch}
        />
      </div>
      <FilterPill
        icon={Tags}
        label="Filter by listing type"
        value={query.listingType ?? ANY}
        onValueChange={(value) => setParams({ listingType: value === ANY ? null : value })}
        options={[
          { value: ANY, label: "Rent and sale" },
          ...LISTING_TYPES.map((value) => ({ value, label: LISTING_LABELS[value] })),
        ]}
      />
      <FilterPill
        icon={Shapes}
        label="Filter by type"
        value={query.propertyType ?? ANY}
        onValueChange={(value) => setParams({ propertyType: value === ANY ? null : value })}
        options={[
          { value: ANY, label: "All types" },
          ...PROPERTY_TYPES.map((propertyType) => ({ value: propertyType, label: formatEnumLabel(propertyType) })),
        ]}
      />
      <FilterPill
        icon={ToggleRight}
        label="Filter by availability"
        value={query.availabilityStatus ?? ANY}
        onValueChange={(value) => setParams({ availabilityStatus: value === ANY ? null : value })}
        options={[
          { value: ANY, label: "Any availability" },
          ...AVAILABILITY_STATUSES.map((value) => ({ value, label: availabilityLabel(value) })),
        ]}
      />
    </>
  );

  const empty =
    tab === "PENDING" && !filtered
      ? {
          icon: CircleCheck,
          title: "All caught up",
          description: "New listings wait here until you approve or reject them.",
          action: (
            <Button variant="outline" onClick={() => setParams({ review: ALL_TAB })}>
              Show all listings
            </Button>
          ),
        }
      : {
          icon: Building2,
          title: filtered
            ? "No listings match"
            : tab === "APPROVED"
              ? "No approved listings yet"
              : tab === "REJECTED"
                ? "No rejected listings"
                : "No listings yet",
          description: filtered
            ? "Try another search term or clear the type and availability filters."
            : "Listings show up here as landlords add them and you review them.",
          action: filtered ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : undefined,
        };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Review new listings, then oversee every home on RentNest, for rent and for sale."
      />

      <Tabs value={tab} onValueChange={(value) => setParams({ review: value === "PENDING" ? null : value })}>
        <div className="max-w-full overflow-x-auto scrollbar-none">
          <TabsList>
            {TABS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
                {value === "PENDING" && pendingCount !== undefined && pendingCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground">
                    {formatNumber(pendingCount)}
                    <span className="sr-only"> waiting</span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {properties.isError ? (
        <QueryError error={properties.error} onRetry={() => void properties.refetch()} />
      ) : (
        <div className={properties.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label={`${TABS.find((item) => item.value === tab)?.label} listings`}
            toolbar={toolbar}
            columns={columns}
            rows={properties.data?.data}
            getRowKey={(property) => property.id}
            isLoading={properties.isPending}
            mobileTitle={(property) => (
              <PropertyCell property={property} href={listingHref(property, ADMIN_PROPERTIES_PATH)} />
            )}
            empty={empty}
          />
        </div>
      )}

      {properties.data && (
        <PaginationNav
          page={properties.data.meta.page}
          totalPages={properties.data.meta.totalPage}
          params={Object.fromEntries(searchParams.entries())}
          pathname={pathname}
        />
      )}

      {review.dialog}
    </div>
  );
}
