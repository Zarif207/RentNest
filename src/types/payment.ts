import type { BookingWithProperty } from "./booking";
import type { PaymentMethod, PaymentProvider, PaymentStatus } from "./enums";

export type Payment = {
  id: string;
  bookingId: string;
  /** Stripe Checkout Session id (cs_...). */
  transactionId: string;
  /** Prisma Decimal, serialized as a string. */
  amount: string;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /payments, GET /payments/:id and POST /payments/confirm. */
export type PaymentWithBooking = Payment & {
  booking: BookingWithProperty;
};

/** POST /payments/create. */
export type CheckoutSession = {
  sessionId: string;
  checkoutUrl: string | null;
  paymentId: string;
};
