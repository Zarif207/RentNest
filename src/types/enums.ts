// Mirrors prisma/schema/enums.prisma in the backend.

export const USER_ROLES = ["ADMIN", "LANDLORD", "TENANT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "BLOCKED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Landlords only (null for tenants and admins); new landlords start PENDING. */
export const LANDLORD_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type LandlordStatus = (typeof LANDLORD_STATUSES)[number];

export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "STUDIO", "VILLA"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const AVAILABILITY_STATUSES = ["AVAILABLE", "RENTED"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "ACTIVE",
  "COMPLETED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type PaymentMethod = "CARD";
export type PaymentProvider = "STRIPE";
