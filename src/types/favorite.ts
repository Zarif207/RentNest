import type { AvailabilityStatus, PropertyType } from "./enums";

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
    /** Prisma Decimal, serialized as a string. */
    rentAmount: string;
    availabilityStatus: AvailabilityStatus;
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    area: number;
    image: string | null;
  };
};
