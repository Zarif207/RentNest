"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HandCoins, LogIn, RotateCcw, TriangleAlert } from "lucide-react";
import { AnimatedCheck } from "@/components/payment/animated-check";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { BUYER_OFFERS_PATH, useConfirmDeposit } from "@/hooks/use-offers";
import { getErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDateTime } from "@/lib/format";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-xl shadow-black/5">
      {children}
    </div>
  );
}

/** /payment/success?type=deposit: confirms the deposit session once, then shows the result. */
export function DepositSuccessView({ sessionId }: { sessionId: string }) {
  const pathname = usePathname();
  const { status: authStatus } = useAuth();
  const { mutate, ...confirmation } = useConfirmDeposit();

  // Confirm exactly once per visit (React strict mode runs effects twice in dev).
  const started = useRef(false);
  useEffect(() => {
    if (authStatus !== "authenticated" || started.current) return;
    started.current = true;
    mutate(sessionId);
  }, [sessionId, authStatus, mutate]);

  if (authStatus === "unauthenticated") {
    const here = `${pathname}?type=deposit&session_id=${encodeURIComponent(sessionId)}`;
    return (
      <Panel>
        <LogIn className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Log in to confirm your deposit</h1>
        <p className="mt-2 text-muted-foreground">
          If you finished checkout, your deposit is safe. Log in with the account you paid from to confirm it.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/auth/login?redirect=${encodeURIComponent(here)}`}>Log in</Link>
        </Button>
      </Panel>
    );
  }

  if (confirmation.isError) {
    return (
      <Panel>
        <TriangleAlert className="size-10 text-destructive" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">We couldn&apos;t confirm your deposit</h1>
        <p className="mt-2 text-muted-foreground">{getErrorMessage(confirmation.error)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => mutate(sessionId)}>
            <RotateCcw data-icon="inline-start" /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={BUYER_OFFERS_PATH}>My offers</Link>
          </Button>
        </div>
      </Panel>
    );
  }

  if (!confirmation.isSuccess) {
    return (
      <Panel>
        <Skeleton className="size-20 rounded-full" />
        <p className="mt-5 text-lg font-semibold" aria-live="polite">
          Confirming your deposit…
        </p>
        <p className="mt-1 text-sm text-muted-foreground">This only takes a moment.</p>
      </Panel>
    );
  }

  const offer = confirmation.data;
  return (
    <Panel>
      <AnimatedCheck />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Deposit received</h1>
      <p className="mt-2 text-muted-foreground">
        The home is now under contract with you, and the owner has been notified.
      </p>

      <dl className="mt-6 w-full space-y-2 rounded-2xl bg-surface p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Home</dt>
          <dd className="truncate font-medium">{offer.property.title}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Agreed price</dt>
          <dd className="font-medium">{formatCurrency(offer.agreedAmount)}</dd>
        </div>
        {offer.payment?.paymentDate && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Paid on</dt>
            <dd className="font-medium">{formatDateTime(offer.payment.paymentDate)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t pt-2 text-base">
          <dt className="font-semibold">Deposit paid</dt>
          <dd className="font-bold">{formatCurrency(offer.payment?.amount ?? offer.depositAmount)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        The owner marks the sale complete when it closes. The rest of the price isn&apos;t paid on RentNest.
      </p>

      <Button asChild className="mt-6 w-full">
        <Link href={BUYER_OFFERS_PATH}>
          <HandCoins data-icon="inline-start" /> My offers
        </Link>
      </Button>
    </Panel>
  );
}
