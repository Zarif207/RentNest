"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";
import { rentalsService } from "@/lib/api/rentals";
import { queryKeys } from "@/lib/query-keys";

export const TENANT_REQUESTS_PATH = "/dashboard/tenant/requests";

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
