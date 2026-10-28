"use client";

import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";
import { rentalsService } from "@/lib/api/rentals";
import { queryKeys } from "@/lib/query-keys";
import type { BookingStatus } from "@/types";

export const TENANT_REQUESTS_PATH = "/dashboard/tenant/requests";

/** The signed-in tenant's rental requests, newest first (optionally one status). */
export function useMyRentals(status?: BookingStatus) {
  return useQuery({
    queryKey: queryKeys.rentals.list(status),
    queryFn: () => rentalsService.getMine(status),
    // Keep the previous tab's rows on screen while the next tab loads.
    placeholderData: keepPreviousData,
  });
}

/** One rental request with its property and payment (tenant or owning landlord). */
export function useRental(id: string) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(id),
    queryFn: () => rentalsService.getById(id),
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: rentalsService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      toast.success("Request sent — the landlord will review it", {
        action: { label: "View my requests", onClick: () => router.push(TENANT_REQUESTS_PATH) },
      });
    },
    // Errors like "You already have a pending rental request…" come straight from the API.
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
