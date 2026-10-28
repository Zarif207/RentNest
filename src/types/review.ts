import type { PaginationQuery } from "./api";
import type { Property } from "./property";
import type { User } from "./user";

export type Review = {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type Reviewer = Pick<User, "id" | "name">;

/** GET /reviews/property/:propertyId. */
export type ReviewWithUser = Review & {
  user: Reviewer;
};

/** POST /reviews. */
export type CreatedReview = ReviewWithUser & {
  property: Property;
};

/** GET /landlord/reviews. */
export type LandlordReview = ReviewWithUser & {
  property: Pick<Property, "id" | "title">;
};

export type CreateReviewInput = {
  propertyId: string;
  rating: number;
  comment: string;
};

export type LandlordReviewQuery = PaginationQuery<"createdAt" | "rating"> & {
  propertyId?: string;
};
