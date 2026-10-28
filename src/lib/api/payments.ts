import type { CheckoutSession, PaymentWithBooking } from "@/types";
import { api } from "./client";

export const paymentsService = {
  /** Creates (or reuses) a Stripe Checkout Session; redirect to `checkoutUrl`. */
  createCheckout: (bookingId: string) =>
    api.post<CheckoutSession>("/payments/create", { bookingId }),

  /** Idempotent: marks the payment PAID and the rental ACTIVE. */
  confirm: (sessionId: string) =>
    api.post<PaymentWithBooking>("/payments/confirm", { sessionId }),

  getMine: () => api.get<PaymentWithBooking[]>("/payments"),

  getById: (id: string) =>
    api.get<PaymentWithBooking>(`/payments/${encodeURIComponent(id)}`),
};
