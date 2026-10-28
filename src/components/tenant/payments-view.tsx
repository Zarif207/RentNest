"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { useMyPayments } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH } from "@/hooks/use-rentals";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaymentWithBooking } from "@/types";

/** "cs_test_a1B2c3…x9Y8" — enough to recognize a Stripe session. */
function shortRef(id: string) {
  return id.length > 22 ? `${id.slice(0, 14)}…${id.slice(-4)}` : id;
}

const columns: DataTableColumn<PaymentWithBooking>[] = [
  {
    key: "date",
    header: "Date",
    // Paid payments have a paymentDate; pending/failed ones only createdAt.
    cell: (payment) => formatDateTime(payment.paymentDate ?? payment.createdAt),
  },
  {
    key: "property",
    header: "Property",
    cell: (payment) => <PropertyCell property={payment.booking.property} />,
    className: "max-w-72",
    hideOnMobile: true,
  },
  {
    key: "amount",
    header: "Amount",
    cell: (payment) => <span className="font-semibold">{formatCurrency(payment.amount)}</span>,
  },
  { key: "status", header: "Status", cell: (payment) => <StatusBadge status={payment.paymentStatus} /> },
  {
    key: "reference",
    header: "Stripe reference",
    cell: (payment) => (
      <span className="inline-flex items-center gap-1">
        <code className="rounded-md bg-secondary px-1.5 py-0.5 text-xs" title={payment.transactionId}>
          {shortRef(payment.transactionId)}
        </code>
        <CopyButton value={payment.transactionId} label="Copy Stripe session ID" />
      </span>
    ),
  },
];

export function PaymentsView() {
  const payments = useMyPayments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every Stripe payment for your rentals, in US dollars."
      />

      {payments.isError ? (
        <QueryError error={payments.error} onRetry={() => void payments.refetch()} />
      ) : (
        <DataTable
          label="Payments"
          columns={columns}
          rows={payments.data}
          getRowKey={(payment) => payment.id}
          isLoading={payments.isPending}
          mobileTitle={(payment) => <PropertyCell property={payment.booking.property} />}
          empty={{
            icon: CreditCard,
            title: "No payments yet",
            description:
              "Once a landlord approves your request, pay from My Requests and the receipt will show up here.",
            action: (
              <Button asChild>
                <Link href={TENANT_REQUESTS_PATH}>View my requests</Link>
              </Button>
            ),
          }}
        />
      )}
    </div>
  );
}
