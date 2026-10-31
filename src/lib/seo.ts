import type { Metadata } from "next";

// Canonical base for every absolute URL (metadata, sitemap, JSON-LD). Set
// NEXT_PUBLIC_SITE_URL to the deployed URL; without it, local dev URLs are used.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "RentNest";

export const SITE_DESCRIPTION =
  "Rent or buy homes across the US. Request a rental or make an offer online, and pay securely through Stripe.";

/** "/rent" → "https://example.com/rent". */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Search engines skip the page but follow its links. */
export const NOINDEX: Metadata["robots"] = { index: false, follow: true };

// The root app/opengraph-image.tsx (and its alt text).
const DEFAULT_IMAGE = { url: "/opengraph-image", alt: "RentNest — Find a home worth coming home to" };

/**
 * Metadata for one public page: title, description, canonical URL, Open
 * Graph and Twitter cards. Setting openGraph here replaces the root
 * opengraph-image, so `image` defaults to it; "route" keeps the route's own
 * opengraph-image file instead (its URL carries a build hash).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  /** The canonical path, without query strings. */
  path: string;
  image?: { url: string; alt: string } | "route";
  noindex?: boolean;
}): Metadata {
  const share = image === "route" ? null : (image ?? DEFAULT_IMAGE);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url: path,
      ...(share && { images: [{ url: share.url, alt: share.alt, ...(!image && { width: 1200, height: 630 }) }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(share && { images: [share.url] }),
    },
    ...(noindex && { robots: NOINDEX }),
  };
}

// Query params that narrow a browse list (paging and sort order don't).
const FILTER_PARAMS = [
  "searchTerm",
  "city",
  "division",
  "propertyType",
  "categoryId",
  "amenities",
  "availabilityStatus",
  "price",
] as const;

/** How many filters a browse URL has; a min/max price pair counts once. */
export function countFilters(params: Record<string, string | string[] | undefined>) {
  const has = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value.some(Boolean) : Boolean(value);
  };
  return FILTER_PARAMS.filter((key) => (key === "price" ? has("minPrice") || has("maxPrice") : has(key))).length;
}

/**
 * Browse pages: the canonical URL never carries filters, and a list narrowed
 * by more than one filter isn't indexed (its links are still followed).
 */
export function browseMetadata(
  page: { title: string; description: string; path: string },
  params: Record<string, string | string[] | undefined>,
): Metadata {
  return pageMetadata({ ...page, noindex: countFilters(params) > 1 });
}
