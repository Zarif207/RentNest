"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, HandCoins, House, Hourglass, MapPin, Undo2, Check } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { OfferStatusPill } from "@/components/offers/offer-status-pill";
import { OfferStatusTabs, useOfferStatusParam } from "@/components/offers/offer-status-tabs";
import { OfferTimeline } from "@/components/offers/offer-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcceptCounter, useMyOffers, useStartDeposit, useWithdrawOffer } from "@/hooks/use-offers";
import { formatCurrency } from "@/lib/format";
import { FINANCING_LABELS, OFFER_STATUS_LABELS } from "@/lib/offers";
import { formatLocation } from "@/lib/us-states";
import type { Offer } from "@/types";

/** Asking, your offer, the counter and the agreed price, as far as the offer got. */
function PriceRow({ offer }: { offer: Offer }) {
  const items = [
    { label: "Asking", value: offer.property.salePrice },
    { label: "Your offer", value: offer.offerAmount },
    ...(offer.counterAmount ? [{ label: "Owner's counter", value: offer.counterAmount }] : []),
    ...(offer.agreedAmount ? [{ label: "Agreed", value: offer.agreedAmount, strong: true }] : []),
  ];
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className={item.strong ? "font-serif text-2xl leading-tight lining-nums" : "font-medium"}>
            {formatCurrency(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function OfferCard({
  offer,
  busy,
  onWithdraw,
}: {
  offer: Offer;
  busy: boolean;
  onWithdraw: (offer: Offer) => void;
}) {
  const acceptCounter = useAcceptCounter();
  const startDeposit = useStartDeposit();
  const image = offer.property.images[0];
  const working = busy || acceptCounter.isPending || startDeposit.isPending;

  return (
    <li className="space-y-5 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <Image src={image} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <House className="m-auto size-6 h-full text-muted-foreground" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <Link href={`/properties/${offer.property.id}`} className="block truncate text-lg font-medium underline-offset-4 hover:underline">
            {offer.property.title}
          </Link>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden /> {formatLocation(offer.property.city, offer.property.division)} ·{" "}
            {FINANCING_LABELS[offer.financing]}
          </p>
        </div>
        <OfferStatusPill status={offer.status} />
      </div>

      <PriceRow offer={offer} />
      <OfferTimeline offer={offer} className="border-t border-border pt-4" />

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        {offer.status === "COUNTERED" && (
          <>
            <Button size="sm" variant="outline" disabled={working} onClick={() => onWithdraw(offer)}>
              Decline
            </Button>
            <Button size="sm" disabled={working} onClick={() => acceptCounter.mutate(offer.id)}>
              <Check data-icon="inline-start" /> Accept {formatCurrency(offer.counterAmount)}
            </Button>
          </>
        )}
        {offer.status === "ACCEPTED" && (
          <>
            <Button size="sm" variant="outline" disabled={working} onClick={() => onWithdraw(offer)}>
              <Undo2 data-icon="inline-start" /> Withdraw
            </Button>
            <Button size="sm" variant="gold" disabled={working} onClick={() => startDeposit.mutate(offer.id)}>
              <CreditCard data-icon="inline-start" /> Pay deposit {formatCurrency(offer.depositAmount)}
            </Button>
          </>
        )}
        {offer.status === "PENDING" && (
          <Button size="sm" variant="outline" disabled={working} onClick={() => onWithdraw(offer)}>
            <Undo2 data-icon="inline-start" /> Withdraw
          </Button>
        )}
        {offer.status === "DEPOSIT_PAID" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hourglass className="size-4" aria-hidden /> Awaiting sale completion by the owner
          </p>
        )}
        {!["COUNTERED", "ACCEPTED", "PENDING", "DEPOSIT_PAID"].includes(offer.status) && (
          <Button asChild size="sm" variant="ghost">
            <Link href={`/properties/${offer.property.id}`}>View home</Link>
          </Button>
        )}
      </div>
    </li>
  );
}

/** The buyer's offers: one card per offer with prices, status, progress and the next action. */
export function OffersView() {
  const status = useOfferStatusParam();
  const offers = useMyOffers(status);
  const withdraw = useWithdrawOffer();
  const [confirm, setConfirm] = useState<Offer | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My offers"
        description="Every offer you've made on a home for sale, the owner's answer, and your next step."
        actions={
          <Button asChild variant="outline">
            <Link href="/buy">Browse homes for sale</Link>
          </Button>
        }
      />

      <OfferStatusTabs />

      {offers.isError ? (
        <QueryError error={offers.error} onRetry={() => void offers.refetch()} />
      ) : offers.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : (offers.data ?? []).length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={status ? `No ${OFFER_STATUS_LABELS[status].toLowerCase()} offers` : "No offers yet"}
          description={
            status
              ? "Offers with this status will show up here."
              : "Find a home for sale and make an offer. You'll follow every step here."
          }
          action={
            <Button asChild>
              <Link href="/buy">Browse homes for sale</Link>
            </Button>
          }
        />
      ) : (
        <ul className={offers.isPlaceholderData ? "space-y-4 opacity-60 transition-opacity" : "space-y-4"}>
          {(offers.data ?? []).map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              busy={withdraw.isPending && withdraw.variables === offer.id}
              onWithdraw={setConfirm}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.status === "COUNTERED" ? "Decline the counteroffer?" : "Withdraw this offer?"}
        description={
          <>
            Your offer on <strong>{confirm?.property.title}</strong> will be withdrawn and the owner will be told.
            You can make a new offer later while the home is for sale.
          </>
        }
        confirmLabel={confirm?.status === "COUNTERED" ? "Decline" : "Withdraw offer"}
        destructive
        isPending={withdraw.isPending}
        onConfirm={() =>
          confirm && withdraw.mutate(confirm.id, { onSettled: () => setConfirm(null) })
        }
      />
    </div>
  );
}
