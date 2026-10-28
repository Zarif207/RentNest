import type { PaginationQuery } from "./api";
import type { BookingStatus } from "./enums";
import type { Payment } from "./payment";
import type { Property } from "./property";
import type { UserSummary } from "./user";

/** A rental request (the backend's Booking model). */
export type Booking = {
  id: string;
  propertyId: string;
  tenantId: string;
  moveInDate: string;
  leaseMonths: number;
  /** Prisma Decimal, serialized as a string. */
  totalRent: string;
  isDeleted: boolean;
  bookingStatus: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

/** POST /rentals and GET /rentals (tenant). */
export type BookingWithProperty = Booking & {
  property: Property;
};

/** GET /rentals/:id. */
export type BookingDetail = BookingWithProperty & {
  payment: Payment | null;
};

/** GET /landlord/requests and PATCH /landlord/requests/:id. */
export type LandlordBooking = BookingWithProperty & {
  tenant: UserSummary;
};

/** PATCH /landlord/requests/:id/complete. */
export type CompletedBooking = LandlordBooking & {
  payment: Payment | null;
};

/** GET /admin/rentals. */
export type AdminBooking = Booking & {
  property: Property & { owner: UserSummary };
  tenant: UserSummary;
  payment: Payment | null;
};

export type CreateRentalInput = {
  propertyId: string;
  /** ISO datetime string. */
  moveInDate: string;
  leaseMonths: number;
};

export type AdminRentalQuery = PaginationQuery<
  "createdAt" | "moveInDate" | "totalRent"
> & {
  status?: BookingStatus;
};
