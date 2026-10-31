import type { PaginationQuery } from "./api";
import type { AvailabilityStatus, PaymentStatus } from "./enums";
import type { Property } from "./property";

// Mirrors the backend's offers module (PurchaseOffer + OfferPayment).

/**
 * PENDING → (owner) COUNTERED | ACCEPTED | REJECTED; COUNTERED → (buyer)
 * ACCEPTED; ACCEPTED → (deposit) DEPOSIT_PAID → (owner) COMPLETED. Open offers
 * can be WITHDRAWN by the buyer and EXPIRE after 7 days without an action.
 */
export const OFFER_STATUSES = [
  "PENDING",
  "COUNTERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "DEPOSIT_PAID",
  "COMPLETED",
  "EXPIRED",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const OFFER_FINANCING = ["CASH", "MORTGAGE", "OTHER"] as const;
export type OfferFinancing = (typeof OFFER_FINANCING)[number];

export type OfferAction = "ACCEPT" | "REJECT" | "COUNTER";

/** The earnest-money deposit for an accepted offer (Stripe Checkout). */
export type OfferPayment = {
  id: string;
  offerId: string;
  /** Stripe Checkout Session id (cs_...). */
  transactionId: string;
  /** Prisma Decimal, serialized as a string. */
  amount: string;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OfferProperty = {
  id: string;
  title: string;
  city: string;
  division: string;
  images: string[];
  salePrice: string | null;
  availabilityStatus: AvailabilityStatus;
  ownerId: string;
};

/** Every offer endpoint returns this shape. Amounts are Decimal strings. */
export type Offer = {
  id: string;
  propertyId: string;
  buyerId: string;
  offerAmount: string;
  counterAmount: string | null;
  agreedAmount: string | null;
  financing: OfferFinancing;
  message: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  property: OfferProperty;
  buyer: { id: string; name: string; email: string; phone: string | null };
  payment: OfferPayment | null;
  /** Deposit in whole dollars once a price is agreed (ACCEPTED and later), else null. */
  depositAmount: number | null;
};

export type CreateOfferInput = {
  propertyId: string;
  offerAmount: number;
  financing: OfferFinancing;
  message?: string;
};

/** POST /offers/:id/deposit. */
export type DepositCheckout = {
  sessionId: string;
  checkoutUrl: string | null;
  depositAmount: number;
  offerPaymentId: string;
};

/** GET /offers/payments: a deposit with its offer and home. */
export type DepositWithOffer = OfferPayment & {
  offer: Omit<Offer, "property" | "buyer" | "payment" | "depositAmount"> & {
    property: Pick<Property, "id" | "title" | "city" | "division" | "images" | "salePrice" | "availabilityStatus" | "ownerId">;
  };
};

export type AdminOfferQuery = PaginationQuery<"createdAt" | "updatedAt" | "offerAmount"> & {
  status?: OfferStatus;
};
