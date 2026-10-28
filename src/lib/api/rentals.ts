import type {
  BookingDetail,
  BookingStatus,
  BookingWithProperty,
  CreateRentalInput,
} from "@/types";
import { api } from "./client";

// Tenant rental requests
export const rentalsService = {
  create: (input: CreateRentalInput) =>
    api.post<BookingWithProperty>("/rentals", input),

  getMine: (status?: BookingStatus) =>
    api.get<BookingWithProperty[]>("/rentals", { query: { status } }),

  getById: (id: string) =>
    api.get<BookingDetail>(`/rentals/${encodeURIComponent(id)}`),
};
