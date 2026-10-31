"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPublicListings } from "@/app/actions/properties";
import { adminOffersService, landlordOffersService } from "@/lib/api/offers";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminOfferQuery, Offer, OfferAction, OfferStatus } from "@/types";

export const OWNER_OFFERS_PATH = "/dashboard/landlord/offers";

const offersKey = queryKeys.landlord.offers.all;

export function useLandlordOffers(status?: OfferStatus, enabled = true) {
  return useQuery({
    queryKey: queryKeys.landlord.offers.list(status),
    queryFn: () => landlordOffersService.getAll(status),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Offers waiting for the owner's answer (nav badge). */
export function usePendingOfferCount(enabled: boolean) {
  const pending = useQuery({
    queryKey: queryKeys.landlord.offers.list("PENDING"),
    queryFn: () => landlordOffersService.getAll("PENDING"),
    enabled,
  });
  // By status, so an optimistic answer drops the count before the refetch.
  return pending.data?.filter((offer) => offer.status === "PENDING").length ?? 0;
}

type Snapshot = [readonly unknown[], Offer[] | undefined][];

/** Sets an offer's fields in every cached list (instant feedback) and returns a rollback snapshot. */
async function patchOptimistically(queryClient: QueryClient, id: string, patch: Partial<Offer>) {
  await queryClient.cancelQueries({ queryKey: offersKey });
  const snapshot: Snapshot = queryClient.getQueriesData({ queryKey: offersKey });
  queryClient.setQueriesData<Offer[]>({ queryKey: offersKey }, (old) =>
    old?.map((offer) => (offer.id === id ? { ...offer, ...patch } : offer)),
  );
  return { snapshot };
}

function rollback(queryClient: QueryClient, context: { snapshot: Snapshot } | undefined) {
  context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

const NEXT_STATUS: Record<OfferAction, OfferStatus> = {
  ACCEPT: "ACCEPTED",
  REJECT: "REJECTED",
  COUNTER: "COUNTERED",
};

const SUCCESS: Record<OfferAction, string> = {
  ACCEPT: "Offer accepted — the buyer can now pay the deposit",
  REJECT: "Offer declined",
  COUNTER: "Counteroffer sent",
};

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, counterAmount }: { id: string; action: OfferAction; counterAmount?: number }) =>
      landlordOffersService.respond(id, action, counterAmount),
    onMutate: ({ id, action, counterAmount }) =>
      patchOptimistically(queryClient, id, {
        status: NEXT_STATUS[action],
        ...(counterAmount !== undefined && { counterAmount: String(counterAmount) }),
      }),
    onError: (error, _variables, context) => {
      rollback(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_offer, { action }) => toast.success(SUCCESS[action]),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: offersKey }),
  });
}

export function useCompleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landlordOffersService.completeSale(id),
    onMutate: (id) => patchOptimistically(queryClient, id, { status: "COMPLETED" }),
    onError: (error, _id, context) => {
      rollback(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => toast.success("Sale completed — the home is marked sold"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: offersKey });
      // The home becomes SOLD.
      void queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties.all });
      void refreshPublicListings();
    },
  });
}

/** Admin: every offer, filtered and paginated. */
export function useAdminOffers(query: AdminOfferQuery) {
  return useQuery({
    queryKey: queryKeys.admin.offers.list(query),
    queryFn: () => adminOffersService.getAll(query),
    placeholderData: keepPreviousData,
  });
}
