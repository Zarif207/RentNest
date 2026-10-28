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
import { getErrorMessage } from "@/lib/api/client";
import { landlordService } from "@/lib/api/landlord";
import { queryKeys } from "@/lib/query-keys";
import type { BookingStatus, LandlordBooking } from "@/types";

const requestsKey = queryKeys.landlord.requests.all;

export function useLandlordRequests(status?: BookingStatus) {
  return useQuery({
    queryKey: queryKeys.landlord.requests.list(status),
    queryFn: () => landlordService.getRequests(status),
    placeholderData: keepPreviousData,
  });
}

/** Number of requests waiting for a decision (sidebar badge). */
export function usePendingRequestCount(enabled: boolean) {
  const pending = useQuery({
    queryKey: queryKeys.landlord.requests.list("PENDING"),
    queryFn: () => landlordService.getRequests("PENDING"),
    enabled,
  });
  // Count by status, not length: an optimistic approve/reject changes the
  // row's status in this cached list before the refetch removes it.
  return pending.data?.filter((request) => request.bookingStatus === "PENDING").length ?? 0;
}

type Snapshot = [readonly unknown[], LandlordBooking[] | undefined][];

/**
 * Optimistically sets a request's status in every cached list (so the badge
 * changes instantly) and returns a snapshot for rollback.
 */
async function setStatusOptimistically(queryClient: QueryClient, id: string, status: BookingStatus) {
  await queryClient.cancelQueries({ queryKey: requestsKey });
  const snapshot: Snapshot = queryClient.getQueriesData({ queryKey: requestsKey });
  queryClient.setQueriesData<LandlordBooking[]>({ queryKey: requestsKey }, (old) =>
    old?.map((request) => (request.id === id ? { ...request, bookingStatus: status } : request)),
  );
  return { snapshot };
}

function rollback(queryClient: QueryClient, context: { snapshot: Snapshot } | undefined) {
  context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

export function useDecideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      landlordService.updateRequestStatus(id, status),
    onMutate: ({ id, status }) => setStatusOptimistically(queryClient, id, status),
    onError: (error, _variables, context) => {
      rollback(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_request, { status }) => {
      toast.success(
        status === "APPROVED" ? "Request approved — the tenant can now pay" : "Request rejected",
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: requestsKey });
    },
  });
}

export function useCompleteRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => landlordService.completeRental(id),
    onMutate: (id) => setStatusOptimistically(queryClient, id, "COMPLETED"),
    onError: (error, _id, context) => {
      rollback(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => toast.success("Rental marked as completed"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: requestsKey });
      // Completing makes the property AVAILABLE again.
      void queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties.all });
      void refreshPublicListings();
    },
  });
}
