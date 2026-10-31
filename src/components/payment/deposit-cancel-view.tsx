"use client";

import Link from "next/link";
import { ArrowLeft, CircleX, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUYER_OFFERS_PATH, useStartDeposit } from "@/hooks/use-offers";
import { isUuid } from "@/lib/utils";

/** /payment/cancel?type=deposit&offerId=…: nothing charged; retry goes straight back to Stripe. */
export function DepositCancelView({ offerId }: { offerId: string | null }) {
  const startDeposit = useStartDeposit();
  const canRetry = offerId !== null && isUuid(offerId);

  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-xl shadow-black/5">
      <span className="grid size-20 place-items-center rounded-full bg-secondary">
        <CircleX className="size-10 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Deposit cancelled</h1>
      <p className="mt-2 text-muted-foreground">
        Nothing was charged. Your offer is still accepted, so you can pay the deposit whenever you&apos;re ready
        (within 7 days of the owner&apos;s answer).
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href={BUYER_OFFERS_PATH}>
            <ArrowLeft data-icon="inline-start" /> Back to my offers
          </Link>
        </Button>
        {canRetry && (
          <Button className="flex-1" disabled={startDeposit.isPending} onClick={() => startDeposit.mutate(offerId)}>
            {startDeposit.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <CreditCard data-icon="inline-start" />}
            Retry deposit
          </Button>
        )}
      </div>
    </div>
  );
}
