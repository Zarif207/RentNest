import type {
  BookingStatus,
  CompletedBooking,
  LandlordBooking,
  LandlordReview,
  LandlordReviewQuery,
  Property,
  PropertyInput,
  PropertyQuery,
  PropertyUpdateInput,
  PropertyWithRelations,
} from "@/types";
import { api } from "./client";

export const landlordService = {
  getProperties: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/landlord/properties", { query }),

  createProperty: (input: PropertyInput) =>
    api.post<Property>("/landlord/properties", input),

  updateProperty: (id: string, input: PropertyUpdateInput) =>
    api.put<Property>(`/landlord/properties/${id}`, input),

  deleteProperty: (id: string) =>
    api.delete<null>(`/landlord/properties/${id}`),

  getRequests: (status?: BookingStatus) =>
    api.get<LandlordBooking[]>("/landlord/requests", { query: { status } }),

  updateRequestStatus: (id: string, status: "APPROVED" | "REJECTED") =>
    api.patch<LandlordBooking>(`/landlord/requests/${id}`, { status }),

  completeRental: (id: string) =>
    api.patch<CompletedBooking>(`/landlord/requests/${id}/complete`),

  getReviews: (query?: LandlordReviewQuery) =>
    api.getPaginated<LandlordReview>("/landlord/reviews", { query }),
};
