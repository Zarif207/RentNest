"use client";

import Image from "@/components/shared/photo";
import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  Hourglass,
  House,
  Loader2,
  Lock,
  SearchX,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartCheckout } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH, useRental } from "@/hooks/use-rentals";
import { isApiError } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import type { BookingStatus } from "@/types";

const NOT_PAYABLE: Record<Exclude<BookingStatus, "APPROVED">, { icon: LucideIcon; title: string; text: string }> = {
  PENDING: {
    icon: Hourglass,
    title: "Waiting for the landlord",
    text: "This request hasn't been approved yet. You can pay as soon as the landlord approves it.",
  },
  ACTIVE: {
    icon: CircleCheck,
    title: "Already paid",
    text: "This rental is paid and active. Your receipt is on the Payments page.",
  },
  COMPLETED: {
    icon: CircleCheck,
    title: "Rental completed",
    text: "This rental has finished, so there's nothing left to pay.",
  },
  REJECTED: {
    icon: XCircle,
    title: "Request rejected",
    text: "The landlord turned this request down, so it can't be paid. Try another home.",
  },
  CANCELLED: {
    icon: XCircle,
    title: "Request cancelled",
    text: "This request was cancelled and can't be paid.",
  },
};

const backButton = (
  <Button asChild variant="outline">
    <Link href={TENANT_REQUESTS_PATH}>
      <ArrowLeft data-icon="inline-start" /> Back to my requests
    </Link>
  </Button>
);

export function PayView({ rentalId }: { rentalId: string }) {
  const rental = useRental(rentalId);
  const checkout = useStartCheckout();

  if (rental.isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-[28rem] max-w-2xl rounded-3xl" />
      </div>
    );
  }

  if (rental.isError) {
    const missing = isApiError(rental.error) && [400, 403, 404].includes(rental.error.status);
    return missing ? (
      <EmptyState
        icon={SearchX}
        title="Request not found"
        description="This rental request doesn't exist or doesn't belong to your account."
        action={backButton}
        className="bg-card"
      />
    ) : (
      <QueryError error={rental.error} onRetry={() => void rental.refetch()} />
    );
  }

  const booking = rental.data;
  const { property } = booking;

  if (booking.bookingStatus !== "APPROVED") {
    const reason = NOT_PAYABLE[booking.bookingStatus];
    return (
      <EmptyState
        icon={reason.icon}
        title={reason.title}
        description={reason.text}
        action={backButton}
        className="bg-card"
      />
    );
  }

  const monthly = Number(booking.totalRent) / booking.leaseMonths;
  const image = property.images[0];
  const rows = [
    { label: "Move-in date", value: formatDate(booking.moveInDate) },
    { label: "Lease length", value: `${booking.leaseMonths} ${booking.leaseMonths === 1 ? "month" : "months"}` },
    { label: "Monthly rent", value: formatCurrency(monthly) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complete your payment"
        description="Your landlord approved this request. Pay the full lease to activate it."
        actions={backButton}
      />

      <div className="max-w-2xl overflow-hidden rounded-3xl border bg-card">
        <div className="relative aspect-21/9 bg-muted">
          {image ? (
            <Image src={image} alt={property.title} fill sizes="672px" className="object-cover" />
          ) : (
            <House className="m-auto h-full size-10 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{property.title}</h2>
              <p className="text-sm text-muted-foreground">
                {property.address}, {formatLocation(property.city, property.division)}
              </p>
            </div>
            <StatusBadge status={booking.bookingStatus} />
          </div>

          <dl className="space-y-3 rounded-2xl bg-surface p-4 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t pt-3 text-base">
              <dt className="font-semibold">Total due (USD)</dt>
              <dd className="text-xl font-semibold tracking-tight">{formatCurrency(booking.totalRent)}</dd>
            </div>
          </dl>

          <Button
            size="lg"
            className="h-13 w-full text-base"
            disabled={checkout.isPending || checkout.isSuccess}
            onClick={() => checkout.mutate(booking.id)}
          >
            {(checkout.isPending || checkout.isSuccess) && <Loader2 className="animate-spin" aria-hidden />}
            {checkout.isPending || checkout.isSuccess ? "Redirecting to Stripe…" : "Proceed to Payment"}
          </Button>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Secured by Stripe. Card details never touch RentNest. Test card: 4242 4242 4242 4242.
          </p>
        </div>
      </div>
    </div>
  );
}
