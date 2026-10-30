"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  House,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Shapes,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { FilterPill } from "@/components/dashboard/bento";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  LANDLORD_PROPERTIES_PATH,
  useDeleteProperty,
  useLandlordProperties,
  useToggleAvailability,
  type LandlordPropertyFilters,
} from "@/hooks/use-landlord-properties";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES, type AvailabilityStatus, type PropertyType, type PropertyWithRelations } from "@/types";

const ANY = "any";
type View = "grid" | "table";

const AVAILABILITY_OPTIONS = [
  { value: ANY, label: "Any status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RENTED", label: "Rented" },
];
const TYPE_OPTIONS = [
  { value: ANY, label: "Any type" },
  ...PROPERTY_TYPES.map((type) => ({ value: type, label: formatEnumLabel(type) })),
];

function AvailabilityBadge({ property }: { property: PropertyWithRelations }) {
  return property.availabilityStatus === "AVAILABLE" ? (
    <Badge variant="active">Available</Badge>
  ) : (
    <Badge variant="completed">Rented</Badge>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <div role="group" aria-label="Layout" className="flex rounded-full border border-border bg-card p-1">
      {(
        [
          { value: "grid", label: "Grid", icon: LayoutGrid },
          { value: "table", label: "Table", icon: List },
        ] as const
      ).map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-label={`${label} view`}
          onClick={() => onChange(value)}
          className={cn(
            "grid size-8 place-items-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
            view === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

export function PropertiesView() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("grid");
  const [filters, setFilters] = useState<LandlordPropertyFilters>({});
  const properties = useLandlordProperties(page, filters);
  const toggle = useToggleAvailability();
  const remove = useDeleteProperty();
  const [deleting, setDeleting] = useState<PropertyWithRelations | null>(null);

  const meta = properties.data?.meta;
  const rows = properties.data?.data;
  const filtered = Boolean(filters.availabilityStatus || filters.propertyType);

  const setFilter = (patch: LandlordPropertyFilters) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const availabilitySwitch = (property: PropertyWithRelations) => (
    <Switch
      checked={property.availabilityStatus === "AVAILABLE"}
      onCheckedChange={(checked) => toggle.mutate({ id: property.id, status: checked ? "AVAILABLE" : "RENTED" })}
      aria-label={`${property.title} is available`}
    />
  );

  const rowActions = (property: PropertyWithRelations) => (
    <div className="flex justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`${LANDLORD_PROPERTIES_PATH}/${property.id}/edit`}>
          <Pencil data-icon="inline-start" /> Edit
        </Link>
      </Button>
      <Button size="sm" variant="destructive" onClick={() => setDeleting(property)}>
        <Trash2 data-icon="inline-start" /> Delete
      </Button>
    </div>
  );

  const columns: DataTableColumn<PropertyWithRelations>[] = [
    {
      key: "property",
      header: "Property",
      cell: (property) => <PropertyCell property={property} />,
      className: "max-w-72",
      hideOnMobile: true,
    },
    { key: "type", header: "Type", cell: (property) => formatEnumLabel(property.propertyType) },
    {
      key: "rent",
      header: "Rent",
      cell: (property) => <span className="font-semibold">{formatCurrency(property.rentAmount)}/mo</span>,
    },
    { key: "status", header: "Status", cell: (property) => <AvailabilityBadge property={property} /> },
    { key: "availability", header: "Listed as available", cell: availabilitySwitch },
    { key: "actions", header: "Actions", className: "text-right", cell: rowActions },
  ];

  const empty = {
    icon: Building2,
    title: filtered ? "No properties match these filters" : "No properties yet",
    description: filtered
      ? "Try another status or type."
      : "List your first home: add photos, rent and amenities in a few minutes.",
    action: filtered ? (
      <Button variant="outline" onClick={() => setFilter({ availabilityStatus: undefined, propertyType: undefined })}>
        Clear filters
      </Button>
    ) : (
      <Button asChild>
        <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
          <Plus data-icon="inline-start" /> Add property
        </Link>
      </Button>
    ),
  };

  const toolbar = (
    <>
      <FilterPill
        icon={ToggleRight}
        label="Availability"
        value={filters.availabilityStatus ?? ANY}
        onValueChange={(value) => setFilter({ availabilityStatus: value === ANY ? undefined : (value as AvailabilityStatus) })}
        options={AVAILABILITY_OPTIONS}
      />
      <FilterPill
        icon={Shapes}
        label="Type"
        value={filters.propertyType ?? ANY}
        onValueChange={(value) => setFilter({ propertyType: value === ANY ? undefined : (value as PropertyType) })}
        options={TYPE_OPTIONS}
      />
      <div className="ml-auto">
        <ViewToggle view={view} onChange={setView} />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My properties"
        description="Edit listings, switch availability and remove homes you no longer rent."
        actions={
          <Button asChild>
            <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
              <Plus data-icon="inline-start" /> Add property
            </Link>
          </Button>
        }
      />

      {properties.isError ? (
        <QueryError error={properties.error} onRetry={() => void properties.refetch()} />
      ) : view === "table" ? (
        <div className={properties.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="My properties"
            toolbar={toolbar}
            columns={columns}
            rows={rows}
            getRowKey={(property) => property.id}
            isLoading={properties.isPending}
            mobileTitle={(property) => <PropertyCell property={property} />}
            empty={empty}
          />
        </div>
      ) : (
        <div className={cn("space-y-4", properties.isPlaceholderData && "opacity-60 transition-opacity")}>
          <div className="flex flex-wrap items-center gap-2 *:max-w-full *:min-w-0">{toolbar}</div>
          {properties.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-96 rounded-3xl" />
              ))}
            </div>
          ) : !rows || rows.length === 0 ? (
            <EmptyState {...empty} className="bg-card" />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="My properties">
              {rows.map((property) => (
                <li key={property.id} className="flex min-w-0 flex-col rounded-3xl border border-border bg-card p-2">
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                    {property.images[0] ? (
                      <Image
                        src={property.images[0]}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <House className="m-auto h-full size-10 text-muted-foreground" aria-hidden />
                    )}
                    <span className="absolute top-3 left-3">
                      <AvailabilityBadge property={property} />
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-full bg-gold px-3 py-1 text-sm font-semibold text-gold-foreground">
                      {formatCurrency(property.rentAmount)}
                      <span className="font-normal opacity-80">/mo</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 px-3 pt-4 pb-3">
                    <div className="min-w-0">
                      <Link
                        href={`/properties/${property.id}`}
                        className="block truncate font-medium underline-offset-4 hover:underline"
                      >
                        {property.title}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatEnumLabel(property.propertyType)} · {formatLocation(property.city, property.division)}
                      </p>
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-2xl bg-foreground/3 px-3 py-2 text-sm">
                      Listed as available
                      {availabilitySwitch(property)}
                    </label>
                    <div className="mt-auto">{rowActions(property)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {meta && meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-end gap-3">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPage}
          </p>
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= meta.totalPage} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight />
          </Button>
        </nav>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this property?"
        description={
          <>
            <strong>{deleting?.title}</strong> will be removed from RentNest. This can&apos;t be
            undone.
          </>
        }
        confirmLabel="Delete property"
        destructive
        isPending={remove.isPending}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })
        }
      />
    </div>
  );
}
