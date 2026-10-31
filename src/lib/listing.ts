import { formatCurrency } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import type { AvailabilityStatus, ListingType, PropertyType } from "@/types";

// Rent vs sale in one place: which price applies, how it reads, and the
// labels for the listing type and status chips.

type Priced = {
  listingType: ListingType;
  rentAmount: string | null;
  salePrice: string | null;
};

export const LISTING_LABELS: Record<ListingType, string> = {
  RENT: "For rent",
  SALE: "For sale",
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: "Available",
  RENTED: "Rented",
  UNDER_CONTRACT: "Under contract",
  SOLD: "Sold",
};

/** The browse page for each listing type. */
export const LISTING_PATHS: Record<ListingType, "/rent" | "/buy"> = {
  RENT: "/rent",
  SALE: "/buy",
};

/** The price that applies: monthly rent for RENT, asking price for SALE. */
export function listingPrice(property: Priced) {
  return property.listingType === "SALE" ? property.salePrice : property.rentAmount;
}

/** "$2,900" + "/mo" for rentals; "$450,000" and no suffix for homes for sale. */
export function formatListingPrice(property: Priced) {
  return {
    amount: formatCurrency(listingPrice(property)),
    suffix: property.listingType === "SALE" ? "" : "/mo",
  };
}

/** One string: "$2,900/mo" or "$450,000". */
export function listingPriceLabel(property: Priced) {
  const { amount, suffix } = formatListingPrice(property);
  return `${amount}${suffix}`;
}

/** Homes for sale only: "$275/sq ft" (null for rentals or without an area). */
export function pricePerSqft(property: Priced & { area: number }) {
  const price = Number(property.salePrice);
  if (property.listingType !== "SALE" || !price || !property.area) return null;
  return `${formatCurrency(Math.round(price / property.area))}/sq ft`;
}

/** "Under contract" etc.; "Available" homes for sale read "For sale". */
export function availabilityLabel(status: AvailabilityStatus) {
  return AVAILABILITY_LABELS[status];
}

const TYPE_WORD: Record<PropertyType, string> = {
  APARTMENT: "apartment",
  HOUSE: "house",
  STUDIO: "studio",
  VILLA: "villa",
};

/**
 * A plain description of the home for titles and alt text, e.g. "3-bed house
 * for sale in Austin, TX" or "Studio for rent in Chicago, IL".
 */
export function listingSummary(property: {
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: number;
  city: string;
  division: string;
}) {
  const home =
    property.propertyType === "STUDIO" || property.bedrooms === 0
      ? "Studio"
      : `${property.bedrooms}-bed ${TYPE_WORD[property.propertyType]}`;
  return `${home} ${LISTING_LABELS[property.listingType].toLowerCase()} in ${formatLocation(property.city, property.division)}`;
}
