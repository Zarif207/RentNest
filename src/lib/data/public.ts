import { cacheLife, cacheTag } from "next/cache";
import { categoriesService } from "@/lib/api/categories";
import { ApiError, getErrorMessage, isApiError } from "@/lib/api/client";
import { propertiesService } from "@/lib/api/properties";
import { reviewsService } from "@/lib/api/reviews";
import { siteSettingsService } from "@/lib/api/site-settings";
import type { PropertyQuery } from "@/types";

// Cached reads for the public, server-rendered pages. With Cache Components,
// `"use cache"` + cacheLife replaces fetch's `next: { revalidate: 60 }`.
// Arguments are part of the cache key, so each query is cached separately.

const PUBLIC_CACHE = { stale: 60, revalidate: 60, expire: 3600 };

/** Tag on every cached listing read; expired when a landlord changes a property. */
export const PROPERTIES_TAG = "properties";

/** Tag on the cached category list; expired when an admin changes categories. */
export const CATEGORIES_TAG = "categories";

/** Tag on the cached homepage settings; expired when an admin saves them. */
export const HOMEPAGE_TAG = "homepage-settings";

/** Cache tag for one property's reviews; expired after a tenant posts a review. */
export function propertyReviewsTag(propertyId: string) {
  return `reviews:${propertyId}`;
}

// A cached function must not throw: an exception escaping "use cache" fails
// the prerender (e.g. `next build` while the API is down) even if the caller
// catches it. So the cached functions return a plain result, and the exported
// wrappers rethrow outside the cache, where pages and error boundaries handle it.
type CacheResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function settle<T>(request: Promise<T>): Promise<CacheResult<T>> {
  try {
    return { ok: true, data: await request };
  } catch (error) {
    return { ok: false, status: isApiError(error) ? error.status : 0, message: getErrorMessage(error) };
  }
}

function unwrap<T>(result: CacheResult<T>): T {
  if (result.ok) return result.data;
  throw new ApiError(result.status, result.message);
}

async function cachedProperties(query: PropertyQuery) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  cacheTag(PROPERTIES_TAG);
  return settle(propertiesService.getAll(query));
}

async function cachedProperty(id: string) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  cacheTag(PROPERTIES_TAG);
  return settle(propertiesService.getById(id));
}

async function cachedCategories() {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  cacheTag(CATEGORIES_TAG);
  return settle(categoriesService.getAll());
}

async function cachedHomepage() {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  // Featured/hero properties come from listings too, so either change expires it.
  cacheTag(HOMEPAGE_TAG, PROPERTIES_TAG);
  return settle(siteSettingsService.getHomepage());
}

async function cachedPropertyStates() {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  cacheTag(PROPERTIES_TAG);
  return settle(propertiesService.getStates());
}

async function cachedPropertyReviews(propertyId: string) {
  "use cache";
  cacheLife(PUBLIC_CACHE);
  cacheTag(propertyReviewsTag(propertyId));
  return settle(reviewsService.getForProperty(propertyId));
}

export async function getPublicProperties(query: PropertyQuery = {}) {
  return unwrap(await cachedProperties(query));
}

/** null when the property doesn't exist (404) or the id is malformed (400). */
export async function getPublicProperty(id: string) {
  const result = await cachedProperty(id);
  if (!result.ok && (result.status === 404 || result.status === 400)) return null;
  return unwrap(result);
}

export async function getPublicCategories() {
  return unwrap(await cachedCategories());
}

export async function getPublicPropertyReviews(propertyId: string) {
  return unwrap(await cachedPropertyReviews(propertyId));
}

export async function getPublicHomepage() {
  return unwrap(await cachedHomepage());
}

export async function getPublicPropertyStates() {
  return unwrap(await cachedPropertyStates());
}

/** Resolves to null instead of throwing, so one failed section doesn't blank the page. */
export function orNull<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch(() => null);
}
