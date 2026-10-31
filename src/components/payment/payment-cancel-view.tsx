"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleX, CreditCard } from "lucide-react";
import { DepositCancelView } from "@/components/payment/deposit-cancel-view";
import { Button } from "@/components/ui/button";
import { PENDING_PAYMENT_KEY } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH } from "@/hooks/use-rentals";
import { isUuid } from "@/lib/utils";

function readPendingBooking() {
  try {
    const id = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    return id && isUuid(id) ? id : null;
  } catch {
    return null;
  }
}

// sessionStorage doesn't change while this page is open.
const subscribe = () => () => {};

/** /payment/cancel: a sale deposit (?type=deposit&offerId=) or, as before, a rental payment. */
export function PaymentCancelView() {
  const searchParams = useSearchParams();
  if (searchParams.get("type") === "deposit") return <DepositCancelView offerId={searchParams.get("offerId")} />;
  return <RentalPaymentCancel />;
}

function RentalPaymentCancel() {
  const bookingId = useSyncExternalStore(subscribe, readPendingBooking, () => null);

  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-xl shadow-black/5">
      <span className="grid size-20 place-items-center rounded-full bg-secondary">
        <CircleX className="size-10 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Payment cancelled</h1>
      <p className="mt-2 text-muted-foreground">
        Nothing was charged. Your request is still approved, so you can pay whenever you&apos;re
        ready.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href={TENANT_REQUESTS_PATH}>
            <ArrowLeft data-icon="inline-start" /> Back to requests
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link
            href={
              bookingId
                ? `${TENANT_REQUESTS_PATH}/${bookingId}/pay`
                : `${TENANT_REQUESTS_PATH}?status=APPROVED`
            }
          >
            <CreditCard data-icon="inline-start" /> Retry payment
          </Link>
        </Button>
      </div>
    </div>
  );
}
