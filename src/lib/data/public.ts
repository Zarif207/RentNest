import { cacheLife } from "next/cache";
import { categoriesService } from "@/lib/api/categories";
import { isApiError } from "@/lib/api/client";
import { propertiesService } from "@/lib/api/properties";
import { reviewsService } from "@/lib/api/reviews";
import type { PropertyQuery } from "@/types";

// Cached reads for the public, server-rendered pages. With Cache Components,
// `"use cache"` + cacheLife replaces fetch's `next: { revalidate: 60 }`.
// Arguments are part of the cache key, so each query is cached separately.

const PUBLIC_CACHE = { stale: 60, revalidate: 60, expire: 3600 };

export async function getPublicProperties(query: PropertyQuery = {}) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  return propertiesService.getAll(query);
}

/** null when the property doesn't exist (404) or the id is malformed (400). */
export async function getPublicProperty(id: string) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  try {
    return await propertiesService.getById(id);
  } catch (error) {
    if (isApiError(error) && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function getPublicCategories() {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  return categoriesService.getAll();
}

export async function getPublicPropertyReviews(propertyId: string) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  return reviewsService.getForProperty(propertyId);
}

/** Resolves to null instead of throwing, so one failed section doesn't blank the page. */
export function orNull<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch(() => null);
}
