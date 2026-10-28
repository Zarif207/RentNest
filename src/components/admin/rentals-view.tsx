"use client";

import { ClipboardList } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusTabs, useStatusParam } from "@/components/dashboard/status-tabs";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { useAdminRentals } from "@/hooks/use-admin";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import type { AdminBooking } from "@/types";

const PAGE_SIZE = 10;

function Person({ name, email }: { name: string; email: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{name}</p>
      <p className="truncate text-xs text-muted-foreground">{email}</p>
    </div>
  );
}

const columns: DataTableColumn<AdminBooking>[] = [
  {
    key: "property",
    header: "Property",
    cell: (rental) => <PropertyCell property={rental.property} />,
    className: "max-w-64",
    hideOnMobile: true,
  },
  { key: "tenant", header: "Tenant", cell: (rental) => <Person {...rental.tenant} /> },
  { key: "landlord", header: "Landlord", cell: (rental) => <Person {...rental.property.owner} /> },
  {
    key: "dates",
    header: "Move-in / lease",
    cell: (rental) => (
      <span>
        {formatDate(rental.moveInDate)}
        <span className="block text-xs text-muted-foreground">
          {rental.leaseMonths} {rental.leaseMonths === 1 ? "month" : "months"}
        </span>
      </span>
    ),
  },
  {
    key: "total",
    header: "Total",
    cell: (rental) => <span className="font-semibold">{formatCurrency(rental.totalRent)}</span>,
  },
  { key: "requested", header: "Requested", cell: (rental) => formatDate(rental.createdAt) },
  {
    key: "status",
    header: "Status",
    cell: (rental) => (
      <span className="inline-flex flex-col items-start gap-1">
        <StatusBadge status={rental.bookingStatus} />
        {rental.payment && (
          <span className="text-xs text-muted-foreground">
            Payment: {formatEnumLabel(rental.payment.paymentStatus).toLowerCase()}
          </span>
        )}
      </span>
    ),
  },
];

/** Read-only view of every rental request on the platform. */
export function AdminRentalsView() {
  const { searchParams, pathname } = useUrlParams();
  const status = useStatusParam();
  const page = Number.parseInt(searchParams.get("page") ?? "", 10);
  const rentals = useAdminRentals({
    status,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentals"
        description="Every rental request across RentNest. Landlords and tenants manage their own; this view is read-only."
      />

      <StatusTabs />

      {rentals.isError ? (
        <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
      ) : (
        <div className={rentals.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="All rentals"
            columns={columns}
            rows={rentals.data?.data}
            getRowKey={(rental) => rental.id}
            isLoading={rentals.isPending}
            mobileTitle={(rental) => <PropertyCell property={rental.property} />}
            empty={{
              icon: ClipboardList,
              title: status ? `No ${formatEnumLabel(status).toLowerCase()} rentals` : "No rentals yet",
              description: status
                ? "Rentals with this status will show up here."
                : "Rental requests from tenants will appear here.",
            }}
          />
        </div>
      )}

      {rentals.data && (
        <PaginationNav
          page={rentals.data.meta.page}
          totalPages={rentals.data.meta.totalPage}
          params={Object.fromEntries(searchParams.entries())}
          pathname={pathname}
        />
      )}
    </div>
  );
}
