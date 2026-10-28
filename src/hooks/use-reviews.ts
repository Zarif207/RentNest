"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPropertyReviews } from "@/app/actions/reviews";
import { getErrorMessage } from "@/lib/api/client";
import { reviewsService } from "@/lib/api/reviews";
import { queryKeys } from "@/lib/query-keys";

export function usePropertyReviews(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.property(propertyId),
    queryFn: () => reviewsService.getForProperty(propertyId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsService.create,
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.property(review.propertyId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
      // Show it on the server-rendered property page right away.
      void refreshPropertyReviews(review.propertyId);
      toast.success("Thanks! Your review is live on the property page");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
