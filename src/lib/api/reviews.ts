import type { CreateReviewInput, CreatedReview, ReviewWithUser } from "@/types";
import { api } from "./client";

export const reviewsService = {
  create: (input: CreateReviewInput) =>
    api.post<CreatedReview>("/reviews", input),

  getForProperty: (propertyId: string) =>
    api.get<ReviewWithUser[]>(
      `/reviews/property/${encodeURIComponent(propertyId)}`,
    ),
};
