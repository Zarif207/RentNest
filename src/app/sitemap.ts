import type { MetadataRoute } from "next";
import { getPublicProperties, getPublicPropertyStates, orNull } from "@/lib/data/public";
import { LISTING_PATHS } from "@/lib/listing";
import { absoluteUrl } from "@/lib/seo";
import { stateSlug } from "@/lib/us-states";
import type { PropertyQuery, PropertyWithRelations } from "@/types";

// Sold homes stay in the sitemap for this long after their last change.
const SOLD_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/rent", priority: 0.9, changeFrequency: "daily" },
  { path: "/buy", priority: 0.9, changeFrequency: "daily" },
  { path: "/properties", priority: 0.8, changeFrequency: "daily" },
  { path: "/sell", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

/** Every listing matching `query`, page by page (the API returns at most 100 at a time). */
async function allListings(query: PropertyQuery) {
  const listings: PropertyWithRelations[] = [];
  for (let page = 1; ; page++) {
    const result = await orNull(getPublicProperties({ ...query, page, limit: 100, sortBy: "createdAt", sortOrder: "desc" }));
    if (!result) break;
    listings.push(...result.data);
    if (page >= result.meta.totalPage) break;
  }
  return listings;
}

/**
 * Static pages, every state landing page and every listing (rentals and homes
 * for sale; sold homes only for 90 days after they sold). One file holds up
 * to 50,000 URLs, far more than the catalog; split it with generateSitemaps
 * if it ever nears 5,000.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listed, sold, rentStates, saleStates] = await Promise.all([
    allListings({}),
    allListings({ availabilityStatus: "SOLD" }),
    orNull(getPublicPropertyStates("RENT")),
    orNull(getPublicPropertyStates("SALE")),
  ]);
  const recentlySold = sold.filter((property) => Date.now() - Date.parse(property.updatedAt) < SOLD_WINDOW_MS);
  const newest = (items: { updatedAt: string }[]) =>
    items.reduce<Date | undefined>((latest, item) => {
      const date = new Date(item.updatedAt);
      return !latest || date > latest ? date : latest;
    }, undefined);

  const statePages = (states: { state: string }[] | null, listingType: "RENT" | "SALE") =>
    (states ?? []).map(({ state }) => ({
      url: absoluteUrl(`${LISTING_PATHS[listingType]}/${stateSlug(state)}`),
      lastModified: newest(listed.filter((p) => p.listingType === listingType && p.division === state)),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [
    ...STATIC_PAGES.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      // Listing pages change whenever a listing does.
      ...(page.changeFrequency === "daily" && { lastModified: newest(listed) }),
    })),
    ...statePages(rentStates, "RENT"),
    ...statePages(saleStates, "SALE"),
    ...[...listed, ...recentlySold].map((property) => ({
      url: absoluteUrl(`/properties/${property.id}`),
      lastModified: new Date(property.updatedAt),
      changeFrequency: "weekly" as const,
      priority: property.availabilityStatus === "SOLD" ? 0.3 : 0.8,
      images: property.images.slice(0, 1),
    })),
  ];
}
