"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusTabs, useStatusParam } from "@/components/dashboard/status-tabs";
import { RequestActions } from "@/components/tenant/request-actions";
import { Button } from "@/components/ui/button";
import { useMyRentals } from "@/hooks/use-rentals";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import type { BookingWithProperty } from "@/types";

const columns: DataTableColumn<BookingWithProperty>[] = [
  {
    key: "property",
    header: "Property",
    cell: (rental) => <PropertyCell property={rental.property} />,
    className: "max-w-72",
    hideOnMobile: true,
  },
  { key: "moveIn", header: "Move-in", cell: (rental) => formatDate(rental.moveInDate) },
  {
    key: "lease",
    header: "Lease",
    cell: (rental) => `${rental.leaseMonths} ${rental.leaseMonths === 1 ? "month" : "months"}`,
  },
  {
    key: "total",
    header: "Total",
    cell: (rental) => <span className="font-semibold">{formatCurrency(rental.totalRent)}</span>,
  },
  { key: "status", header: "Status", cell: (rental) => <StatusBadge status={rental.bookingStatus} /> },
  {
    key: "actions",
    header: "Actions",
    cell: (rental) => <RequestActions rental={rental} />,
    className: "text-right",
  },
];

export function RequestsView() {
  const status = useStatusParam();
  const rentals = useMyRentals(status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My requests"
        description="Track every rental request, pay for approved ones and review your stays."
        actions={
          <Button asChild variant="outline">
            <Link href="/properties">Browse properties</Link>
          </Button>
        }
      />

      {rentals.isError ? (
        <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
      ) : (
        <div className={rentals.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Rental requests"
            toolbar={<StatusTabs />}
            columns={columns}
            rows={rentals.data}
            getRowKey={(rental) => rental.id}
            isLoading={rentals.isPending}
            mobileTitle={(rental) => <PropertyCell property={rental.property} />}
            empty={{
              icon: ClipboardList,
              title: status ? `No ${formatEnumLabel(status).toLowerCase()} requests` : "No requests yet",
              description: status
                ? "Requests with this status will show up here."
                : "Find a home you like and send a request to rent. It will appear here.",
              action: (
                <Button asChild>
                  <Link href="/properties">Browse properties</Link>
                </Button>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}
