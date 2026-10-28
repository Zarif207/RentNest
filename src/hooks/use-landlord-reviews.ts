"use client";

import { useQuery } from "@tanstack/react-query";
import { landlordService } from "@/lib/api/landlord";
import { queryKeys } from "@/lib/query-keys";

// The API caps a page at 100; that covers every review a demo landlord has,
// and meta.total still reports the true count.
const QUERY = { limit: 100, sortBy: "createdAt", sortOrder: "desc" } as const;

/** Reviews left on the signed-in landlord's properties, newest first. */
export function useLandlordReviews() {
  return useQuery({
    queryKey: queryKeys.landlord.reviews.list(QUERY),
    queryFn: () => landlordService.getReviews(QUERY),
  });
}
