import type {
  AdminRentalQuery,
  AdminUserQuery,
  BookingStatus,
  LandlordReviewQuery,
  PropertyQuery,
} from "@/types";

// Hierarchical keys: invalidating a prefix (e.g. queryKeys.rentals.all)
// also invalidates every list and detail below it.
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  properties: {
    all: ["properties"] as const,
    list: (query: PropertyQuery = {}) => ["properties", "list", query] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  reviews: {
    property: (propertyId: string) => ["reviews", "property", propertyId] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    list: (status?: BookingStatus) => ["rentals", "list", status ?? "ALL"] as const,
    detail: (id: string) => ["rentals", "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },
  landlord: {
    properties: {
      all: ["landlord", "properties"] as const,
      list: (query: PropertyQuery = {}) =>
        ["landlord", "properties", "list", query] as const,
    },
    requests: {
      all: ["landlord", "requests"] as const,
      list: (status?: BookingStatus) =>
        ["landlord", "requests", "list", status ?? "ALL"] as const,
    },
    reviews: {
      all: ["landlord", "reviews"] as const,
      list: (query: LandlordReviewQuery = {}) =>
        ["landlord", "reviews", "list", query] as const,
    },
  },
  admin: {
    users: {
      all: ["admin", "users"] as const,
      list: (query: AdminUserQuery = {}) => ["admin", "users", "list", query] as const,
    },
    properties: {
      all: ["admin", "properties"] as const,
      list: (query: PropertyQuery = {}) =>
        ["admin", "properties", "list", query] as const,
    },
    rentals: {
      all: ["admin", "rentals"] as const,
      list: (query: AdminRentalQuery = {}) =>
        ["admin", "rentals", "list", query] as const,
    },
  },
};
