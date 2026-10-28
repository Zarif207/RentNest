"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, LogIn, RotateCcw, Star, TriangleAlert } from "lucide-react";
import { AnimatedCheck } from "@/components/payment/animated-check";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmPayment } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH } from "@/hooks/use-rentals";
import { getErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

// A payment confirmed earlier than this (e.g. by the webhook, or on a
// previous visit to this page) is shown as "already confirmed".
const ALREADY_CONFIRMED_AFTER_MS = 2 * 60 * 1000;

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-xl shadow-black/5">
      {children}
    </div>
  );
}

export function PaymentSuccessView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status: authStatus } = useAuth();
  const { mutate, ...confirmation } = useConfirmPayment();
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const confirm = useCallback(
    (id: string) =>
      mutate(id, {
        onSuccess: (payment) => {
          const paidAt = payment.paymentDate ? new Date(payment.paymentDate).getTime() : Date.now();
          setAlreadyConfirmed(Date.now() - paidAt > ALREADY_CONFIRMED_AFTER_MS);
        },
      }),
    [mutate],
  );

  // Confirm exactly once per visit (React strict mode runs effects twice in dev).
  const started = useRef(false);
  useEffect(() => {
    if (!sessionId || authStatus !== "authenticated" || started.current) return;
    started.current = true;
    confirm(sessionId);
  }, [sessionId, authStatus, confirm]);

  if (!sessionId) {
    return (
      <Panel>
        <TriangleAlert className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Missing payment reference</h1>
        <p className="mt-2 text-muted-foreground">
          This page needs the reference Stripe adds after checkout. Check your rental status in
          your dashboard instead.
        </p>
        <Button asChild className="mt-6">
          <Link href={TENANT_REQUESTS_PATH}>View my requests</Link>
        </Button>
      </Panel>
    );
  }

  if (authStatus === "unauthenticated") {
    const here = `${pathname}?session_id=${encodeURIComponent(sessionId)}`;
    return (
      <Panel>
        <LogIn className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Log in to confirm your payment</h1>
        <p className="mt-2 text-muted-foreground">
          If you finished checkout, your payment is safe. Log in with the account you paid
          from and we&apos;ll activate your rental.
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
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">We couldn&apos;t confirm your payment</h1>
        <p className="mt-2 text-muted-foreground">{getErrorMessage(confirmation.error)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => confirm(sessionId)}>
            <RotateCcw data-icon="inline-start" /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={TENANT_REQUESTS_PATH}>View my requests</Link>
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
          Confirming your payment…
        </p>
        <p className="mt-1 text-sm text-muted-foreground">This only takes a moment.</p>
        <div className="mt-6 w-full space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </Panel>
    );
  }

  const payment = confirmation.data;
  const { property } = payment.booking;

  return (
    <Panel>
      <AnimatedCheck />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {alreadyConfirmed ? "Payment already confirmed" : "Payment successful"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {alreadyConfirmed
          ? `This payment was confirmed on ${formatDateTime(payment.paymentDate)}. Your rental is active.`
          : "Thanks! Your rental is now active and the landlord has been notified."}
      </p>

      <dl className="mt-6 w-full space-y-2 rounded-2xl bg-surface p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Property</dt>
          <dd className="truncate font-medium">{property.title}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Move-in</dt>
          <dd className="font-medium">{formatDate(payment.booking.moveInDate)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t pt-2 text-base">
          <dt className="font-semibold">Amount paid</dt>
          <dd className="font-bold italic">{formatCurrency(payment.amount)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
        {/* The review dialog arrives in step 16; until then this opens active rentals. */}
        <Button asChild variant="outline" className="flex-1">
          <Link href={`${TENANT_REQUESTS_PATH}?status=ACTIVE`}>
            <Star data-icon="inline-start" /> Leave a review
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard/tenant">
            <LayoutDashboard data-icon="inline-start" /> Go to dashboard
          </Link>
        </Button>
      </div>
    </Panel>
  );
}
