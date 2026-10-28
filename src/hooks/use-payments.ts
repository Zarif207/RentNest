"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/lib/api/payments";
import { queryKeys } from "@/lib/query-keys";

/** The signed-in tenant's payments, newest first. */
export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsService.getMine,
  });
}
