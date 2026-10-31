import type { PaginationQuery } from "./api";
import type { CategorySummary } from "./category";
import type { AvailabilityStatus, PropertyType } from "./enums";
import type { UserSummary } from "./user";

/** A bare property row (create/update responses and nested in rentals). */
export type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  division: string;
  /** Prisma Decimal, serialized as a string. */
  rentAmount: string;
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
  createdAt: string;
  updatedAt: string;
};

/** Property lists and details include the category and owner. */
export type PropertyWithRelations = Property & {
  category: CategorySummary | null;
  owner: UserSummary;
};

export type PropertySortBy =
  | "createdAt"
  | "rentAmount"
  | "area"
  | "bedrooms"
  | "title";

export type PropertyQuery = PaginationQuery<PropertySortBy> & {
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
};

export type PropertyInput = {
  title: string;
  description: string;
  address: string;
  city: string;
  division: string;
  rentAmount: number;
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
  /** Prisma Decimal, serialized as a string. */
  rentAmount: string;
  city: string;
  division: string;
  availabilityStatus: AvailabilityStatus;
  image: string | null;
};

export type PropertyUpdateInput = Partial<PropertyInput> & {
  availabilityStatus?: AvailabilityStatus;
};
