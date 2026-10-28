"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  LANDLORD_PROPERTIES_PATH,
  useDeleteProperty,
  useLandlordProperties,
  useToggleAvailability,
} from "@/hooks/use-landlord-properties";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import type { PropertyWithRelations } from "@/types";

export function PropertiesView() {
  const [page, setPage] = useState(1);
  const properties = useLandlordProperties(page);
  const toggle = useToggleAvailability();
  const remove = useDeleteProperty();
  const [deleting, setDeleting] = useState<PropertyWithRelations | null>(null);

  const meta = properties.data?.meta;

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
    {
      key: "availability",
      header: "Listed as available",
      cell: (property) => (
        <Switch
          checked={property.availabilityStatus === "AVAILABLE"}
          onCheckedChange={(checked) =>
            toggle.mutate({ id: property.id, status: checked ? "AVAILABLE" : "RENTED" })
          }
          aria-label={`${property.title} is available`}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (property) => (
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
      ),
    },
  ];

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
      ) : (
        <div className={properties.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="My properties"
            columns={columns}
            rows={properties.data?.data}
            getRowKey={(property) => property.id}
            isLoading={properties.isPending}
            mobileTitle={(property) => <PropertyCell property={property} />}
            empty={{
              icon: Building2,
              title: "No properties yet",
              description: "List your first home: add photos, rent and amenities in a few minutes.",
              action: (
                <Button asChild>
                  <Link href={`${LANDLORD_PROPERTIES_PATH}/new`}>
                    <Plus data-icon="inline-start" /> Add property
                  </Link>
                </Button>
              ),
            }}
          />
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
