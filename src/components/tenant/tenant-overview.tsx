"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  House,
  Hourglass,
  KeyRound,
  MapPin,
  Search,
} from "lucide-react";
import { BentoCard, BentoGrid, MetricCard, ProgressPair } from "@/components/dashboard/bento";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusPill } from "@/components/dashboard/status-badge";
import { LeaveReviewButton } from "@/components/reviews/leave-review-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMyPayments } from "@/hooks/use-payments";
import { TENANT_REQUESTS_PATH, useMyRentals } from "@/hooks/use-rentals";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import type { BookingWithProperty } from "@/types";

const TIMELINE_COUNT = 5;
const PAYMENTS_COUNT = 4;

const noop = () => () => {};

/** "Good morning" by the viewer's clock (plain "Welcome back" during SSR). */
function useGreeting() {
  return useSyncExternalStore(
    noop,
    () => {
      const hour = new Date().getHours();
      return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    },
    () => "Welcome back",
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The single most useful next step, from the tenant's real requests. */
function nextAction(list: BookingWithProperty[]) {
  const approved = list.filter((rental) => rental.bookingStatus === "APPROVED");
  if (approved.length > 0) {
    return {
      text: `You have ${plural(approved.length, "request")} ready to pay.`,
      detail: `${approved[0].property.title} was approved. Pay securely with Stripe to move in.`,
      cta: { href: `/dashboard/tenant/requests/${approved[0].id}/pay`, label: "Pay now", icon: CreditCard },
    };
  }
  const pending = list.filter((rental) => rental.bookingStatus === "PENDING").length;
  if (pending > 0) {
    return {
      text: `${plural(pending, "request")} waiting on the landlord.`,
      detail: "You'll be able to pay as soon as one is approved.",
      cta: { href: TENANT_REQUESTS_PATH, label: "View requests", icon: ClipboardList },
    };
  }
  const active = list.find((rental) => rental.bookingStatus === "ACTIVE");
  if (active) {
    return {
      text: `You're settled in at ${active.property.title}.`,
      detail: "Enjoying it? A review helps the next tenant decide.",
      cta: { href: TENANT_REQUESTS_PATH, label: "Leave a review", icon: ClipboardList },
    };
  }
  return {
    text: "Let's find your next home.",
    detail: "Browse homes across the US and send your first request in minutes.",
    cta: { href: "/properties", label: "Browse homes", icon: Search },
  };
}

function WelcomeCard({ list, isLoading }: { list: BookingWithProperty[]; isLoading: boolean }) {
  const { user } = useAuth();
  const greeting = useGreeting();
  const action = nextAction(list);
  const Icon = action.cta.icon;

  return (
    <section className="flex flex-col justify-between gap-10 rounded-3xl bg-[#12100e] p-6 text-white sm:p-8 md:col-span-6 lg:col-span-7">
      <div>
        <p className="text-sm text-white/60">{greeting},</p>
        <h1 className="mt-1 text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
          {user ? user.name.split(" ")[0] : <Skeleton className="h-12 w-48 bg-white/10" />}
        </h1>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full max-w-md bg-white/10" />
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-md">
            <p className="font-serif text-2xl leading-snug text-gold sm:text-3xl">{action.text}</p>
            <p className="mt-2 text-sm text-white/65">{action.detail}</p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link href={action.cta.href}>
              <Icon data-icon="inline-start" /> {action.cta.label}
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function ActiveHomeCard({ rental }: { rental: BookingWithProperty | undefined }) {
  if (!rental) {
    return (
      <BentoCard title="Your home" className="md:col-span-6 lg:col-span-5">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
          <House className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">No active rental yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Once you pay for an approved request, your new home shows up here.
          </p>
        </div>
      </BentoCard>
    );
  }
  const { property } = rental;
  const image = property.images[0];
  return (
    <section className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl bg-muted p-6 text-white md:col-span-6 lg:col-span-5">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">Your home</span>
        <StatusPill status="ACTIVE" />
      </div>
      <Link href={`/properties/${property.id}`} className="text-2xl font-medium tracking-tight underline-offset-4 hover:underline">
        {property.title}
      </Link>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
        <MapPin className="size-4" aria-hidden /> {formatLocation(property.city, property.division)}
      </p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-sm">
        <div>
          <dt className="text-white/60">Moved in</dt>
          <dd className="font-medium">{formatDate(rental.moveInDate)}</dd>
        </div>
        <div>
          <dt className="text-white/60">Lease</dt>
          <dd className="font-medium">{plural(rental.leaseMonths, "month")}</dd>
        </div>
        <div>
          <dt className="text-white/60">Paid</dt>
          <dd className="font-medium">{formatCurrency(rental.totalRent)}</dd>
        </div>
      </dl>
    </section>
  );
}

function RequestTimeline({ list }: { list: BookingWithProperty[] }) {
  const recent = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, TIMELINE_COUNT);
  return (
    <ol className="relative space-y-1">
      <span aria-hidden className="absolute top-3 bottom-3 left-[1.6rem] w-px bg-border" />
      {recent.map((rental) => (
        <li key={rental.id} className="relative flex flex-wrap items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-foreground/3">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted ring-4 ring-card">
            {rental.property.images[0] && (
              <Image src={rental.property.images[0]} alt="" fill sizes="48px" className="object-cover" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{rental.property.title}</p>
            <p className="text-xs text-muted-foreground">
              Move-in {formatDate(rental.moveInDate)} · {formatCurrency(rental.totalRent)}
            </p>
          </div>
          <StatusPill status={rental.bookingStatus} />
          {rental.bookingStatus === "APPROVED" && (
            <Button asChild size="sm">
              <Link href={`/dashboard/tenant/requests/${rental.id}/pay`}>
                <CreditCard data-icon="inline-start" /> Pay Now
              </Link>
            </Button>
          )}
          {(rental.bookingStatus === "ACTIVE" || rental.bookingStatus === "COMPLETED") && (
            <LeaveReviewButton rental={rental} />
          )}
        </li>
      ))}
    </ol>
  );
}

export function TenantOverview() {
  const rentals = useMyRentals();
  const payments = useMyPayments();

  const list = rentals.data ?? [];
  const count = (...statuses: string[]) => list.filter((rental) => statuses.includes(rental.bookingStatus)).length;
  const paid = (payments.data ?? []).filter((payment) => payment.paymentStatus === "PAID");
  const totalPaid = paid.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const activeRental = list.find((rental) => rental.bookingStatus === "ACTIVE");

  return (
    <BentoGrid>
      <WelcomeCard list={list} isLoading={rentals.isPending} />

      <BentoCard title="Requests by status" href={TENANT_REQUESTS_PATH} className="md:col-span-6 lg:col-span-5">
        {rentals.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-1 flex-col justify-end">
            <ProgressPair
              left={{ label: "Moved in", value: count("ACTIVE", "COMPLETED") }}
              right={{ label: "In progress", value: count("PENDING", "APPROVED") }}
              total={list.length}
            />
            {count("REJECTED", "CANCELLED") > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Hatched: {plural(count("REJECTED", "CANCELLED"), "request")} declined or cancelled.
              </p>
            )}
          </div>
        )}
      </BentoCard>

      <MetricCard
        label="Total requests"
        value={formatNumber(list.length)}
        icon={ClipboardList}
        isLoading={rentals.isPending}
        className="md:col-span-3 lg:col-span-3"
      />
      <MetricCard
        label="Pending"
        value={formatNumber(count("PENDING"))}
        hint="Waiting for the landlord"
        icon={Hourglass}
        isLoading={rentals.isPending}
        className="md:col-span-3 lg:col-span-3"
      />
      <MetricCard
        label="Active rentals"
        value={formatNumber(count("ACTIVE"))}
        hint="Paid and moved in"
        icon={KeyRound}
        isLoading={rentals.isPending}
        className="md:col-span-3 lg:col-span-3"
      />
      <MetricCard
        label="Total paid"
        value={payments.isError ? "—" : formatCurrency(totalPaid)}
        hint="Successful Stripe payments"
        icon={CircleDollarSign}
        isLoading={payments.isPending}
        className="md:col-span-3 lg:col-span-3"
      />

      {!rentals.isPending && !rentals.isError && <ActiveHomeCard rental={activeRental} />}

      <BentoCard
        title="Request timeline"
        href={TENANT_REQUESTS_PATH}
        className={!rentals.isPending && !rentals.isError ? "md:col-span-6 lg:col-span-7" : "md:col-span-6 lg:col-span-12"}
      >
        {rentals.isError ? (
          <QueryError error={rentals.error} onRetry={() => void rentals.refetch()} />
        ) : rentals.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requests yet"
            description="Find a home you like and request to rent it. Each step will show up here."
            action={
              <Button asChild>
                <Link href="/properties">
                  Browse homes <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            }
          />
        ) : (
          <RequestTimeline list={list} />
        )}
      </BentoCard>

      <BentoCard title="Recent payments" href="/dashboard/tenant/payments" className="md:col-span-6 lg:col-span-12">
        {payments.isError ? (
          <QueryError error={payments.error} onRetry={() => void payments.refetch()} />
        ) : payments.isPending ? (
          <Skeleton className="h-16 rounded-2xl" />
        ) : (payments.data ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No payments yet. When a landlord approves a request, pay for it here and your receipt appears.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(payments.data ?? []).slice(0, PAYMENTS_COUNT).map((payment) => (
              <li key={payment.id} className="space-y-3 rounded-2xl bg-foreground/3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-3xl leading-none lining-nums">{formatCurrency(payment.amount)}</p>
                  <StatusPill status={payment.paymentStatus} />
                </div>
                <div>
                  <p className="truncate text-sm font-medium">{payment.booking.property.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(payment.paymentDate ?? payment.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </BentoCard>
    </BentoGrid>
  );
}
