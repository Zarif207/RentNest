"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, CircleCheckBig, HandCoins, X } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { ApprovalTooltip } from "@/components/landlord/approval";
import { CounterOfferDialog } from "@/components/landlord/counter-offer-dialog";
import { OfferStatusPill } from "@/components/offers/offer-status-pill";
import { OfferStatusTabs, useOfferStatusParam } from "@/components/offers/offer-status-tabs";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useLandlordAccess } from "@/hooks/use-landlord-access";
import { useCompleteSale, useLandlordOffers, useRespondToOffer } from "@/hooks/use-landlord-offers";
import { formatCurrency, formatDate } from "@/lib/format";
import { FINANCING_LABELS, OFFER_STATUS_LABELS, percentOfAsking } from "@/lib/offers";
import type { Offer } from "@/types";

type PendingConfirm = { type: "reject" | "complete"; offer: Offer };

function BuyerCell({ buyer }: { buyer: Offer["buyer"] }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={buyer.name} className="size-9" />
      <div className="min-w-0">
        <p className="truncate font-medium">{buyer.name}</p>
        <a href={`mailto:${buyer.email}`} className="block truncate text-xs text-muted-foreground hover:underline">
          {buyer.email}
        </a>
      </div>
    </div>
  );
}

/** Asking vs offer, the counter or agreed price when there is one. */
function PriceCell({ offer }: { offer: Offer }) {
  const asking = Number(offer.property.salePrice) || null;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="font-semibold">{formatCurrency(offer.agreedAmount ?? offer.offerAmount)}</p>
      <p className="text-xs text-muted-foreground">
        {offer.agreedAmount
          ? "Agreed"
          : offer.counterAmount
            ? `Offer ${formatCurrency(offer.offerAmount)} · you countered ${formatCurrency(offer.counterAmount)}`
            : (percentOfAsking(Number(offer.offerAmount), asking) ?? "")}
      </p>
      {asking && <p className="text-xs text-muted-foreground">Asking {formatCurrency(asking)}</p>}
    </div>
  );
}

/** The owner's offers: accept, reject or counter, then close the sale once the deposit is in. */
export function LandlordOffersView() {
  const status = useOfferStatusParam();
  const offers = useLandlordOffers(status);
  const respond = useRespondToOffer();
  const complete = useCompleteSale();
  const { canWrite } = useLandlordAccess();
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [countering, setCountering] = useState<Offer | null>(null);

  const busyId = (respond.isPending && respond.variables?.id) || (complete.isPending && complete.variables) || null;

  const columns: DataTableColumn<Offer>[] = [
    { key: "buyer", header: "Buyer", cell: (offer) => <BuyerCell buyer={offer.buyer} />, hideOnMobile: true },
    { key: "property", header: "Home", cell: (offer) => <PropertyCell property={offer.property} />, className: "max-w-60" },
    { key: "price", header: "Offer", cell: (offer) => <PriceCell offer={offer} /> },
    {
      key: "financing",
      header: "Financing",
      cell: (offer) => (
        <div className="max-w-56 space-y-0.5 text-sm">
          <p>{FINANCING_LABELS[offer.financing]}</p>
          {offer.message && (
            <p className="line-clamp-2 text-xs text-muted-foreground" title={offer.message}>
              “{offer.message}”
            </p>
          )}
        </div>
      ),
    },
    { key: "date", header: "Received", cell: (offer) => formatDate(offer.createdAt) },
    { key: "status", header: "Status", cell: (offer) => <OfferStatusPill status={offer.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (offer) => {
        const busy = busyId === offer.id;
        if (offer.status === "PENDING") {
          return (
            <ApprovalTooltip className="w-full justify-end">
              <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" disabled={busy || !canWrite} onClick={() => respond.mutate({ id: offer.id, action: "ACCEPT" })}>
                  <Check data-icon="inline-start" /> Accept
                </Button>
                <Button size="sm" variant="outline" disabled={busy || !canWrite} onClick={() => setCountering(offer)}>
                  <ArrowLeftRight data-icon="inline-start" /> Counter
                </Button>
                <Button size="sm" variant="outline" disabled={busy || !canWrite} onClick={() => setConfirm({ type: "reject", offer })}>
                  <X data-icon="inline-start" /> Reject
                </Button>
              </div>
            </ApprovalTooltip>
          );
        }
        if (offer.status === "COUNTERED" || offer.status === "ACCEPTED") {
          return (
            <ApprovalTooltip className="w-full justify-end">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {offer.status === "COUNTERED" ? "Waiting for the buyer" : "Waiting for the deposit"}
                </span>
                <Button size="sm" variant="outline" disabled={busy || !canWrite} onClick={() => setConfirm({ type: "reject", offer })}>
                  <X data-icon="inline-start" /> Reject
                </Button>
              </div>
            </ApprovalTooltip>
          );
        }
        if (offer.status === "DEPOSIT_PAID") {
          return (
            <ApprovalTooltip className="w-full justify-end">
              <div className="flex justify-end">
                <Button size="sm" disabled={busy || !canWrite} onClick={() => setConfirm({ type: "complete", offer })}>
                  <CircleCheckBig data-icon="inline-start" /> Mark sale completed
                </Button>
              </div>
            </ApprovalTooltip>
          );
        }
        return <span className="block text-right text-sm text-muted-foreground">—</span>;
      },
    },
  ];

  const onConfirm = () => {
    if (!confirm) return;
    // The dialog closes right away; the optimistic update shows the result.
    if (confirm.type === "reject") respond.mutate({ id: confirm.offer.id, action: "REJECT" });
    else complete.mutate(confirm.offer.id);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Offers on your homes for sale: accept, counter or decline, then complete the sale once the deposit is paid."
      />

      {offers.isError ? (
        <QueryError error={offers.error} onRetry={() => void offers.refetch()} />
      ) : (
        <div className={offers.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Offers"
            toolbar={<OfferStatusTabs />}
            columns={columns}
            rows={offers.data}
            getRowKey={(offer) => offer.id}
            isLoading={offers.isPending}
            mobileTitle={(offer) => <BuyerCell buyer={offer.buyer} />}
            empty={{
              icon: HandCoins,
              title: status ? `No ${OFFER_STATUS_LABELS[status].toLowerCase()} offers` : "No offers yet",
              description: status
                ? "Offers with this status will show up here."
                : "When buyers make offers on your homes for sale, they appear here for you to answer.",
            }}
          />
        </div>
      )}

      <CounterOfferDialog
        offer={countering}
        onOpenChange={(open) => !open && setCountering(null)}
        isPending={false}
        onSubmit={(offer, counterAmount) => {
          respond.mutate({ id: offer.id, action: "COUNTER", counterAmount });
          setCountering(null);
        }}
      />
      <ConfirmDialog
        open={confirm?.type === "reject"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Decline this offer?"
        description={
          <>
            {confirm?.offer.buyer.name}&apos;s offer of {formatCurrency(confirm?.offer.agreedAmount ?? confirm?.offer.offerAmount)}{" "}
            on <strong>{confirm?.offer.property.title}</strong> will be declined. They&apos;ll be notified.
          </>
        }
        confirmLabel="Decline offer"
        destructive
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={confirm?.type === "complete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Mark this sale as completed?"
        description={
          <>
            <strong>{confirm?.offer.property.title}</strong> will be marked sold to {confirm?.offer.buyer.name} for{" "}
            {formatCurrency(confirm?.offer.agreedAmount)}. Only do this once the sale has closed; it can&apos;t be
            undone.
          </>
        }
        confirmLabel="Mark sale completed"
        onConfirm={onConfirm}
      />
    </div>
  );
}
