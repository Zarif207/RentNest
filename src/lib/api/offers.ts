import type {
  AdminOfferQuery,
  CreateOfferInput,
  DepositCheckout,
  DepositWithOffer,
  Offer,
  OfferAction,
  OfferStatus,
} from "@/types";
import { api } from "./client";

const offerPath = (id: string) => `/offers/${encodeURIComponent(id)}`;
const landlordOfferPath = (id: string) => `/landlord/offers/${encodeURIComponent(id)}`;

// Buyers (tenants)
export const offersService = {
  create: (input: CreateOfferInput) => api.post<Offer>("/offers", input),

  getMine: (status?: OfferStatus) => api.get<Offer[]>("/offers", { query: { status } }),

  getById: (id: string) => api.get<Offer>(offerPath(id)),

  withdraw: (id: string) => api.patch<Offer>(`${offerPath(id)}/withdraw`),

  acceptCounter: (id: string) => api.patch<Offer>(`${offerPath(id)}/accept-counter`),

  /** Creates (or reuses) a Stripe Checkout Session for the deposit; redirect to `checkoutUrl`. */
  createDeposit: (id: string) => api.post<DepositCheckout>(`${offerPath(id)}/deposit`),

  /** Idempotent: marks the deposit PAID and the home UNDER_CONTRACT. */
  confirmDeposit: (sessionId: string) => api.post<Offer>("/offers/confirm", { sessionId }),

  getMyDeposits: () => api.get<DepositWithOffer[]>("/offers/payments"),
};

// Owners (approved landlords)
export const landlordOffersService = {
  getAll: (status?: OfferStatus) => api.get<Offer[]>("/landlord/offers", { query: { status } }),

  respond: (id: string, action: OfferAction, counterAmount?: number) =>
    api.patch<Offer>(landlordOfferPath(id), { action, counterAmount }),

  completeSale: (id: string) => api.patch<Offer>(`${landlordOfferPath(id)}/complete-sale`),
};

// Admins
export const adminOffersService = {
  getAll: (query?: AdminOfferQuery) => api.getPaginated<Offer>("/admin/offers", { query }),
};
