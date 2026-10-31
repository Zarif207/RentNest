"use client";

import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPublicListings } from "@/app/actions/properties";
import { getErrorMessage } from "@/lib/api/client";
import { offersService } from "@/lib/api/offers";
import { queryKeys } from "@/lib/query-keys";
import type { OfferStatus } from "@/types";

export const BUYER_OFFERS_PATH = "/dashboard/tenant/offers";

/** The signed-in buyer's offers, newest first (optionally one status). */
export function useMyOffers(status?: OfferStatus, enabled = true) {
  return useQuery({
    queryKey: queryKeys.offers.list(status),
    queryFn: () => offersService.getMine(status),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The buyer's earnest-money deposits (any status). */
export function useMyDeposits() {
  return useQuery({
    queryKey: queryKeys.offers.deposits,
    queryFn: offersService.getMyDeposits,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: offersService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      toast.success("Offer sent — the owner will reply", {
        action: { label: "View my offers", onClick: () => router.push(BUYER_OFFERS_PATH) },
      });
    },
    // The dialog maps field errors; the toast carries the API's message either way.
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offersService.withdraw,
    onSuccess: () => toast.success("Offer withdrawn"),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.offers.all }),
  });
}

export function useAcceptCounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offersService.acceptCounter,
    onSuccess: (offer) =>
      toast.success("Counteroffer accepted", {
        description: offer.depositAmount
          ? `Pay the $${offer.depositAmount.toLocaleString("en-US")} deposit to put the home under contract.`
          : undefined,
      }),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.offers.all }),
  });
}

/** Creates (or reuses) the deposit's Stripe Checkout Session and redirects to it. */
export function useStartDeposit() {
  return useMutation({
    mutationFn: offersService.createDeposit,
    onSuccess: ({ checkoutUrl }) => {
      if (!checkoutUrl) {
        toast.error("Stripe didn't return a checkout link. Please try again.");
        return;
      }
      toast.success("Redirecting to Stripe…");
      window.location.assign(checkoutUrl);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Confirms a finished deposit session; the home goes under contract. */
export function useConfirmDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offersService.confirmDeposit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      // The home is now under contract on the public pages too.
      void refreshPublicListings();
      toast.success("Deposit confirmed — the home is under contract");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
