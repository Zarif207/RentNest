import type { PaginationQuery } from "./api";
import type { CategorySummary } from "./category";
import type { AvailabilityStatus, ListingType, PropertyType, ReviewStatus } from "./enums";
import type { UserSummary } from "./user";

/** A bare property row (create/update responses and nested in rentals). */
export type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  division: string;
  listingType: ListingType;
  /** Monthly rent for RENT listings (Prisma Decimal as a string); null for SALE. */
  rentAmount: string | null;
  /** Asking price for SALE listings (Prisma Decimal as a string); null for RENT. */
  salePrice: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: PropertyType;
  availabilityStatus: AvailabilityStatus;
  categoryId: string | null;
  amenities: string[];
  images: string[];
  /** Map pin; null when the address couldn't be geocoded. */
  latitude: number | null;
  longitude: number | null;
  ownerId: string;
  /** New listings start PENDING; public endpoints only return APPROVED ones. */
  reviewStatus: ReviewStatus;
  /**
   * The admin's reason for a rejection. Only sent to the owner and admins
   * (public responses leave it out).
   */
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Property lists and details include the category and owner. */
export type PropertyWithRelations = Property & {
  category: CategorySummary | null;
  owner: UserSummary;
};

/** "price" sorts by rent for RENT and by sale price for SALE. */
export type PropertySortBy =
  | "createdAt"
  | "price"
  | "rentAmount"
  | "area"
  | "bedrooms"
  | "title";

export type PropertyQuery = PaginationQuery<PropertySortBy> & {
  listingType?: ListingType;
  searchTerm?: string;
  city?: string;
  division?: string;
  propertyType?: PropertyType;
  availabilityStatus?: AvailabilityStatus;
  categoryId?: string;
  /** Comma-separated; a property must have every listed amenity. */
  amenities?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Admin and landlord lists only (public lists are always APPROVED). */
  reviewStatus?: ReviewStatus;
};

/** PATCH /admin/properties/:id/review. A rejection needs a note (3–500 chars). */
export type PropertyReviewInput = { status: "APPROVED"; note?: string } | { status: "REJECTED"; note: string };

export type PropertyInput = {
  title: string;
  description: string;
  address: string;
  city: string;
  division: string;
  /** RENT (the default) needs rentAmount; SALE needs salePrice. */
  listingType: ListingType;
  rentAmount?: number;
  salePrice?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: PropertyType;
  categoryId: string;
  amenities: string[];
  images: string[];
  /** A pin set by the landlord; without one the backend geocodes the address. */
  latitude?: number;
  longitude?: number;
};

/** GET /properties/map: one pin per property that has coordinates. */
export type MapProperty = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  listingType: ListingType;
  /** Prisma Decimals as strings; only the one for the listing type is set. */
  rentAmount: string | null;
  salePrice: string | null;
  /** Whichever of the two applies. */
  price: string | null;
  city: string;
  division: string;
  availabilityStatus: AvailabilityStatus;
  image: string | null;
};

export type PropertyUpdateInput = Partial<PropertyInput> & {
  availabilityStatus?: AvailabilityStatus;
};
