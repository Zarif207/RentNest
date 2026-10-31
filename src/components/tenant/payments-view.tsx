"use client";

import Link from "next/link";
import { CalendarCheck, CircleDollarSign, CreditCard, Receipt } from "lucide-react";
import { MetricCard } from "@/components/dashboard/bento";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { useMyDeposits } from "@/hooks/use-offers";
import { useMyPayments } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH } from "@/hooks/use-rentals";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { PaymentStatus, Property } from "@/types";

/** A rent payment or a sale deposit, as one row. */
type PaymentRow = {
  id: string;
  kind: "RENT" | "DEPOSIT";
  date: string;
  property: Pick<Property, "id" | "title" | "images" | "city" | "division">;
  amount: string;
  paymentStatus: PaymentStatus;
  transactionId: string;
};

/** "cs_test_a1B2c3…x9Y8" — enough to recognize a Stripe session. */
function shortRef(id: string) {
  return id.length > 22 ? `${id.slice(0, 14)}…${id.slice(-4)}` : id;
}

const columns: DataTableColumn<PaymentRow>[] = [
  { key: "date", header: "Date", cell: (payment) => formatDateTime(payment.date) },
  {
    key: "property",
    header: "Property",
    cell: (payment) => <PropertyCell property={payment.property} />,
    className: "max-w-72",
    hideOnMobile: true,
  },
  {
    key: "type",
    header: "Type",
    cell: (payment) => (
      <Badge variant={payment.kind === "DEPOSIT" ? "gold" : "secondary"}>
        {payment.kind === "DEPOSIT" ? "Deposit" : "Rent"}
      </Badge>
    ),
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
  const rentPayments = useMyPayments();
  const deposits = useMyDeposits();
  // Rent payments and sale deposits in one list, newest first. Paid ones have
  // a paymentDate; pending/failed ones only createdAt.
  const rows: PaymentRow[] | undefined =
    rentPayments.data && deposits.data
      ? [
          ...rentPayments.data.map((payment) => ({
            id: payment.id,
            kind: "RENT" as const,
            date: payment.paymentDate ?? payment.createdAt,
            property: payment.booking.property,
            amount: payment.amount,
            paymentStatus: payment.paymentStatus,
            transactionId: payment.transactionId,
          })),
          ...deposits.data.map((deposit) => ({
            id: deposit.id,
            kind: "DEPOSIT" as const,
            date: deposit.paymentDate ?? deposit.createdAt,
            property: deposit.offer.property,
            amount: deposit.amount,
            paymentStatus: deposit.paymentStatus,
            transactionId: deposit.transactionId,
          })),
        ].sort((a, b) => b.date.localeCompare(a.date))
      : undefined;
  const payments = {
    data: rows,
    isPending: rentPayments.isPending || deposits.isPending,
    isError: rentPayments.isError || deposits.isError,
    error: rentPayments.error ?? deposits.error,
    refetch: () => Promise.all([rentPayments.refetch(), deposits.refetch()]),
  };
  const paid = (payments.data ?? []).filter((payment) => payment.paymentStatus === "PAID");
  const totalPaid = paid.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const lastPaid = paid
    .map((payment) => payment.date)
    .sort()
    .at(-1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every Stripe payment, rent and home deposits, in US dollars."
      />

      {!payments.isError && (
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <MetricCard
            label="Total paid"
            value={formatCurrency(totalPaid)}
            hint="Successful payments, USD"
            icon={CircleDollarSign}
            isLoading={payments.isPending}
          />
          <MetricCard
            label="Payments"
            value={formatNumber(payments.data?.length ?? 0)}
            hint={`${formatNumber(paid.length)} paid`}
            icon={Receipt}
            isLoading={payments.isPending}
          />
          <MetricCard
            label="Last payment"
            value={lastPaid ? formatDate(lastPaid) : "—"}
            hint={lastPaid ? "Most recent successful payment" : "No payments yet"}
            icon={CalendarCheck}
            isLoading={payments.isPending}
            className="[&_p.font-serif]:text-3xl"
          />
        </div>
      )}

      {payments.isError ? (
        <QueryError error={payments.error} onRetry={() => void payments.refetch()} />
      ) : (
        <DataTable
          label="Payments"
          columns={columns}
          rows={payments.data}
          getRowKey={(payment) => payment.id}
          isLoading={payments.isPending}
          mobileTitle={(payment) => <PropertyCell property={payment.property} />}
          empty={{
            icon: CreditCard,
            title: "No payments yet",
            description:
              "Rent you pay for approved requests and deposits on accepted offers show up here.",
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
