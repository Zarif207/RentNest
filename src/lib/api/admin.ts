import type {
  AdminBooking,
  AdminRentalQuery,
  AdminUserQuery,
  LandlordStatusUpdate,
  PropertyQuery,
  PropertyWithRelations,
  User,
  UserStatus,
  UserStatusUpdate,
} from "@/types";
import { api } from "./client";

export const adminService = {
  // Selects every user field except the password, so rows match User.
  getUsers: (query?: AdminUserQuery) =>
    api.getPaginated<User>("/admin/users", { query }),

  /** Ban (BLOCKED) or unban (ACTIVE) a user. */
  updateUserStatus: (id: string, userStatus: UserStatus) =>
    api.patch<UserStatusUpdate>(`/admin/users/${id}`, { userStatus }),

  /** Approve or reject a landlord (takes effect on their next write request). */
  updateLandlordStatus: (id: string, landlordStatus: "APPROVED" | "REJECTED") =>
    api.patch<LandlordStatusUpdate>(`/admin/users/${id}/landlord-status`, { landlordStatus }),

  getProperties: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/admin/properties", { query }),

  getRentals: (query?: AdminRentalQuery) =>
    api.getPaginated<AdminBooking>("/admin/rentals", { query }),
};
