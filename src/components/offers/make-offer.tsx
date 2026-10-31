"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CircleCheck, HandCoins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { BUYER_OFFERS_PATH, useMyOffers } from "@/hooks/use-offers";
import { isOpenOffer, OFFER_STATUS_LABELS } from "@/lib/offers";
import type { AvailabilityStatus } from "@/types";

type MakeOfferProps = {
  property: { id: string; title: string; salePrice: string | null; availabilityStatus: AvailabilityStatus };
};

const buttonClass = "h-13 w-full text-base";

// The form loads on demand, like the rental request dialog.
const loadDialog = () => import("@/components/offers/make-offer-dialog");
const MakeOfferDialog = dynamic(() => loadDialog().then((module) => module.MakeOfferDialog));

function OfferButtonContent() {
  return (
    <>
      <HandCoins data-icon="inline-start" /> Make an offer
    </>
  );
}

/** Disabled button with a reason: tooltip on hover/focus, plain text for touch. */
function DisabledOffer({ reason }: { reason: string }) {
  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="block rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Button variant="gold" size="lg" className={buttonClass} disabled>
              <OfferButtonContent />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
      <p className="text-center text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}

/**
 * "Make an offer" on a home for sale. Signed out → log in first; landlords
 * and admins can't buy; a buyer with an open offer on this home sees it
 * instead; otherwise the offer dialog opens.
 */
export function MakeOffer({ property }: MakeOfferProps) {
  const { user, isLoading } = useAuth();
  const isTenant = user?.role === "TENANT";
  const offers = useMyOffers(undefined, isTenant);
  const [open, setOpen] = useState(false);
  const [dialogMounted, setDialogMounted] = useState(false);

  if (property.availabilityStatus === "UNDER_CONTRACT") {
    return <DisabledOffer reason="This home is under contract" />;
  }
  if (property.availabilityStatus !== "AVAILABLE") {
    return <DisabledOffer reason="This home has been sold" />;
  }

  if (isLoading || (isTenant && offers.isPending)) {
    return (
      <Button variant="gold" size="lg" className={buttonClass} disabled>
        <Loader2 className="animate-spin" aria-hidden /> Make an offer
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="gold" size="lg" className={buttonClass}>
        <Link href={`/auth/login?redirect=${encodeURIComponent(`/properties/${property.id}`)}`}>
          <OfferButtonContent />
        </Link>
      </Button>
    );
  }

  if (!isTenant) {
    return <DisabledOffer reason="Only tenant accounts can make offers" />;
  }

  // One open offer per home: show it rather than letting a second one fail.
  const openOffer = offers.data?.find((offer) => offer.propertyId === property.id && isOpenOffer(offer.status));
  if (openOffer) {
    return (
      <div className="space-y-3">
        <Button asChild variant="outline" size="lg" className={buttonClass}>
          <Link href={BUYER_OFFERS_PATH}>View my offer</Link>
        </Button>
        <p className="flex items-center justify-center gap-2 text-sm">
          <CircleCheck className="size-4 text-[#4a5f3c] dark:text-[#bccfab]" aria-hidden />
          Your offer is {OFFER_STATUS_LABELS[openOffer.status].toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="gold"
        size="lg"
        className={buttonClass}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        onClick={() => {
          setDialogMounted(true);
          setOpen(true);
        }}
      >
        <OfferButtonContent />
      </Button>
      {dialogMounted && (
        <MakeOfferDialog open={open} onOpenChange={setOpen} property={property} onSent={() => setOpen(false)} />
      )}
    </>
  );
}
