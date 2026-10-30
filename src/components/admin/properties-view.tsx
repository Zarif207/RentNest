"use client";

import { useCallback } from "react";
import { Building2, ExternalLink, Search, Shapes, ToggleRight } from "lucide-react";
import { FilterPill } from "@/components/dashboard/bento";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminProperties } from "@/hooks/use-admin";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import {
  AVAILABILITY_STATUSES,
  PROPERTY_TYPES,
  type AvailabilityStatus,
  type PropertyType,
  type PropertyWithRelations,
} from "@/types";

const ANY = "any";
const PAGE_SIZE = 10;

const columns: DataTableColumn<PropertyWithRelations>[] = [
  {
    key: "property",
    header: "Property",
    cell: (property) => <PropertyCell property={property} />,
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
  { key: "type", header: "Type", cell: (property) => formatEnumLabel(property.propertyType) },
  {
    key: "rent",
    header: "Rent",
    cell: (property) => <span className="font-semibold">{formatCurrency(property.rentAmount)}/mo</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (property) =>
      property.availabilityStatus === "AVAILABLE" ? (
        <Badge variant="active">Available</Badge>
      ) : (
        <Badge variant="completed">Rented</Badge>
      ),
  },
  { key: "listed", header: "Listed", cell: (property) => formatDate(property.createdAt) },
  {
    key: "view",
    header: "",
    className: "text-right",
    cell: (property) => (
      <Button asChild size="sm" variant="outline">
        <a href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
          View <ExternalLink data-icon="inline-end" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
    ),
  },
];

export function AdminPropertiesView() {
  const { searchParams, pathname, setParams, clear } = useUrlParams();

  const type = searchParams.get("propertyType") as PropertyType | null;
  const availability = searchParams.get("availabilityStatus") as AvailabilityStatus | null;
  const page = Number.parseInt(searchParams.get("page") ?? "", 10);
  const query = {
    searchTerm: searchParams.get("searchTerm")?.trim() || undefined,
    propertyType: type && PROPERTY_TYPES.includes(type) ? type : undefined,
    availabilityStatus: availability && AVAILABILITY_STATUSES.includes(availability) ? availability : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
  };

  const properties = useAdminProperties(query);
  const commitSearch = useCallback((value: string) => setParams({ searchTerm: value }), [setParams]);

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
          { value: "AVAILABLE", label: "Available" },
          { value: "RENTED", label: "Rented" },
        ]}
      />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description="Every listing on RentNest, from every landlord." />

      {properties.isError ? (
        <QueryError error={properties.error} onRetry={() => void properties.refetch()} />
      ) : (
        <div className={properties.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="All properties"
            toolbar={toolbar}
            columns={columns}
            rows={properties.data?.data}
            getRowKey={(property) => property.id}
            isLoading={properties.isPending}
            mobileTitle={(property) => <PropertyCell property={property} />}
            empty={{
              icon: Building2,
              title: "No listings match",
              description: "Try another search term or clear the type and availability filters.",
              action: (
                <Button variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              ),
            }}
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
    </div>
  );
}
