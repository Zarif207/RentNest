"use server";

import { updateTag } from "next/cache";
import { propertyReviewsTag } from "@/lib/data/public";
import { isUuid } from "@/lib/utils";

/**
 * Expires the cached reviews of one property so its public page shows a
 * review right after it's posted (instead of after the 60s cache window).
 * It only clears a cache entry, so it's safe to expose.
 */
export async function refreshPropertyReviews(propertyId: string) {
  if (!isUuid(propertyId)) return;
  updateTag(propertyReviewsTag(propertyId));
}
