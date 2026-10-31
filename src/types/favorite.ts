import type { AvailabilityStatus, ListingType, PropertyType } from "./enums";

/** A saved property (POST /favorites). */
export type Favorite = {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
};

/** GET /favorites: the property is trimmed to what a card needs, with its first image. */
export type FavoriteWithProperty = Favorite & {
  property: {
    id: string;
    title: string;
    city: string;
    division: string;
    listingType: ListingType;
    /** Prisma Decimals as strings; only the one for the listing type is set. */
    rentAmount: string | null;
    salePrice: string | null;
    availabilityStatus: AvailabilityStatus;
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    area: number;
    image: string | null;
  };
};
