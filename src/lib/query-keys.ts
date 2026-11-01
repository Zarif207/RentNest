import type {
  AdminOfferQuery,
  AdminRentalQuery,
  AdminUserQuery,
  BookingStatus,
  LandlordReviewQuery,
  NotificationQuery,
  OfferStatus,
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
  homepage: ["site-settings", "homepage"] as const,
  reviews: {
    property: (propertyId: string) => ["reviews", "property", propertyId] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    list: (status?: BookingStatus) => ["rentals", "list", status ?? "ALL"] as const,
    detail: (id: string) => ["rentals", "detail", id] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    ids: ["favorites", "ids"] as const,
    list: ["favorites", "list"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    lists: ["notifications", "list"] as const,
    list: (query: NotificationQuery = {}) => ["notifications", "list", query] as const,
    summary: ["notifications", "summary"] as const,
  },
  offers: {
    all: ["offers"] as const,
    list: (status?: OfferStatus) => ["offers", "list", status ?? "ALL"] as const,
    detail: (id: string) => ["offers", "detail", id] as const,
    deposits: ["offers", "deposits"] as const,
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
    offers: {
      all: ["landlord", "offers"] as const,
      list: (status?: OfferStatus) => ["landlord", "offers", "list", status ?? "ALL"] as const,
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
    offers: {
      all: ["admin", "offers"] as const,
      list: (query: AdminOfferQuery = {}) => ["admin", "offers", "list", query] as const,
    },
    homepage: ["admin", "site-settings", "homepage"] as const,
  },
  propertyStates: ["properties", "states"] as const,
};
