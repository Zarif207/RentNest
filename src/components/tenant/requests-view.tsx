"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RequestActions } from "@/components/tenant/request-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRentals } from "@/hooks/use-rentals";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import type { BookingStatus, BookingWithProperty } from "@/types";

const ALL = "ALL";
const TABS = [ALL, "PENDING", "APPROVED", "ACTIVE", "COMPLETED", "REJECTED"] as const;
type Tab = (typeof TABS)[number];

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ?status= drives the tab, so a filtered list can be bookmarked or shared.
  const requested = searchParams.get("status")?.toUpperCase();
  const tab: Tab = TABS.find((value) => value === requested) ?? ALL;
  const status = tab === ALL ? undefined : (tab as BookingStatus);

  const rentals = useMyRentals(status);

  const selectTab = (value: string) => {
    router.replace(value === ALL ? pathname : `${pathname}?status=${value}`, { scroll: false });
  };

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

      <Tabs value={tab} onValueChange={selectTab}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            {TABS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {value === ALL ? "All" : formatEnumLabel(value)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {rentals.isError ? (
        <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
      ) : (
        <div className={rentals.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Rental requests"
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
