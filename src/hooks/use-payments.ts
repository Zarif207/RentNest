"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";
import { paymentsService } from "@/lib/api/payments";
import { queryKeys } from "@/lib/query-keys";

// Stripe's cancel URL carries no booking id, so we remember which rental the
// tenant was paying for to offer "Retry payment" on /payment/cancel.
export const PENDING_PAYMENT_KEY = "rn_pending_payment_booking";

/** The signed-in tenant's payments, newest first. */
export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsService.getMine,
  });
}

/** Creates (or reuses) a Stripe Checkout Session and redirects to it. */
export function useStartCheckout() {
  return useMutation({
    mutationFn: paymentsService.createCheckout,
    onSuccess: ({ checkoutUrl }, bookingId) => {
      if (!checkoutUrl) {
        toast.error("Stripe didn't return a checkout link. Please try again.");
        return;
      }
      try {
        sessionStorage.setItem(PENDING_PAYMENT_KEY, bookingId);
      } catch {
        // Storage can be unavailable (private mode); retry still works from the requests list.
      }
      toast.success("Redirecting to Stripe…");
      window.location.assign(checkoutUrl);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Confirms a finished Checkout Session; marks the payment PAID and the rental ACTIVE. */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsService.confirm,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      try {
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      } catch {
        // Nothing to clean up if storage is unavailable.
      }
      toast.success("Payment confirmed — your rental is now active");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
