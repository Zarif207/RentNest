import type { OfferFinancing, OfferStatus } from "@/types";

// Offer rules as the backend applies them, for labels and previews.

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: "Pending",
  COUNTERED: "Countered",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  DEPOSIT_PAID: "Deposit paid",
  COMPLETED: "Completed",
  EXPIRED: "Expired",
};

export const FINANCING_LABELS: Record<OfferFinancing, string> = {
  CASH: "Cash",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

/** Offers still in play: a buyer holds at most one of these per home. */
export const OPEN_OFFER_STATUSES: OfferStatus[] = ["PENDING", "COUNTERED", "ACCEPTED"];

export const isOpenOffer = (status: OfferStatus) => OPEN_OFFER_STATUSES.includes(status);

/** Earnest-money deposit: 1% of the agreed price, at least $500, whole dollars. */
export function depositFor(price: number) {
  return Math.max(500, Math.round(price * 0.01));
}

/** "96% of asking" (null without both numbers). */
export function percentOfAsking(offer: number, asking: number | null) {
  if (!asking || !offer) return null;
  return `${Math.round((offer / asking) * 100)}% of asking`;
}
