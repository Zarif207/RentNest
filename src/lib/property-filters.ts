import { formatAmenity, formatCurrency, formatEnumLabel } from "@/lib/format";
import { isUuid } from "@/lib/utils";
import { PROPERTY_TYPES, type Category, type ListingType, type PropertyQuery, type PropertyType } from "@/types";

// URL search params <-> browse filters. Shared by the server page (to query
// the API) and the client filter UI (to show and update the current state).
// Invalid values are dropped so a hand-edited URL can't trigger a 400.

export const PAGE_SIZE = 9;

export const PRICE_MIN = 0;

/**
 * The price filter for each listing type: monthly rent up to $10k, or a sale
 * price up to $5M (the top of the slider means "and up"). Browsing both types
 * has no price filter, since one range can't fit both.
 */
export const PRICE_RANGES = {
  RENT: { max: 10_000, step: 100, title: "Monthly rent", noun: "monthly rent" },
  SALE: { max: 5_000_000, step: 25_000, title: "Price", noun: "price" },
} as const satisfies Record<ListingType, { max: number; step: number; title: string; noun: string }>;

// "price" sorts by rent for rentals and by sale price for homes for sale.
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
  { value: "price-asc", label: "Price: low to high", sortBy: "price", sortOrder: "asc" },
  { value: "price-desc", label: "Price: high to low", sortBy: "price", sortOrder: "desc" },
  { value: "largest", label: "Largest", sortBy: "area", sortOrder: "desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const COMMON_AMENITIES = [
  "wifi",
  "parking",
  "air-conditioning",
  "furnished",
  "laundry",
  "elevator",
  "pool",
  "garden",
  "gym",
  "pet-friendly",
];

export type BrowseFilters = {
  searchTerm: string;
  city: string;
  division: string;
  propertyType: PropertyType | null;
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  amenities: string[];
  availableOnly: boolean;
  sort: SortValue;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function positiveNumber(value: string) {
  const number = Number(value);
  return value !== "" && Number.isFinite(number) && number > 0 ? number : null;
}

/** `listingType` is the page's (fixed) type; without one, price filters are ignored. */
export function readFilters(params: RawParams, listingType: ListingType | null = null): BrowseFilters {
  const propertyType = first(params.propertyType).toUpperCase();
  const categoryId = first(params.categoryId);
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page), 10);

  let minPrice = listingType ? positiveNumber(first(params.minPrice)) : null;
  let maxPrice = listingType ? positiveNumber(first(params.maxPrice)) : null;
  // The backend rejects min > max; swap instead of failing.
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    searchTerm: first(params.searchTerm),
    city: first(params.city),
    division: first(params.division),
    propertyType: PROPERTY_TYPES.includes(propertyType as PropertyType)
      ? (propertyType as PropertyType)
      : null,
    categoryId: isUuid(categoryId) ? categoryId : null,
    minPrice,
    maxPrice,
    amenities: [
      ...new Set(
        first(params.amenities)
          .split(",")
          .map((amenity) => amenity.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
    availableOnly: first(params.availabilityStatus) === "AVAILABLE",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function toPropertyQuery(filters: BrowseFilters, listingType: ListingType | null = null): PropertyQuery {
  const sort = SORT_OPTIONS.find((option) => option.value === filters.sort) ?? SORT_OPTIONS[0];

  return {
    listingType: listingType ?? undefined,
    searchTerm: filters.searchTerm || undefined,
    city: filters.city || undefined,
    division: filters.division || undefined,
    propertyType: filters.propertyType ?? undefined,
    categoryId: filters.categoryId ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    amenities: filters.amenities.length ? filters.amenities.join(",") : undefined,
    availabilityStatus: filters.availableOnly ? "AVAILABLE" : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}

/** The filters currently applied, as removable chips (shared by the chips row and the page). */
export type FilterChip = { key: string; label: string; clear: Record<string, string | null> };

export function getActiveChips(filters: BrowseFilters, categories: Category[]): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.searchTerm) {
    chips.push({ key: "searchTerm", label: `“${filters.searchTerm}”`, clear: { searchTerm: null } });
  }
  if (filters.city) chips.push({ key: "city", label: filters.city, clear: { city: null } });
  if (filters.division) {
    chips.push({ key: "division", label: filters.division, clear: { division: null } });
  }
  if (filters.propertyType) {
    chips.push({
      key: "propertyType",
      label: formatEnumLabel(filters.propertyType),
      clear: { propertyType: null },
    });
  }
  if (filters.categoryId) {
    const category = categories.find((item) => item.id === filters.categoryId);
    chips.push({
      key: "categoryId",
      label: category ? category.name : "Category",
      clear: { categoryId: null },
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const label =
      filters.minPrice !== null && filters.maxPrice !== null
        ? `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`
        : filters.minPrice !== null
          ? `From ${formatCurrency(filters.minPrice)}`
          : `Up to ${formatCurrency(filters.maxPrice)}`;
    chips.push({ key: "price", label, clear: { minPrice: null, maxPrice: null } });
  }
  for (const amenity of filters.amenities) {
    const rest = filters.amenities.filter((item) => item !== amenity).join(",");
    chips.push({ key: `amenity-${amenity}`, label: formatAmenity(amenity), clear: { amenities: rest } });
  }
  if (filters.availableOnly) {
    chips.push({ key: "available", label: "Available only", clear: { availabilityStatus: null } });
  }

  return chips;
}
