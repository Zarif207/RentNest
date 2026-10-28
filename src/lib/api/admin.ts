import type {
  AdminBooking,
  AdminRentalQuery,
  AdminUserQuery,
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

  getProperties: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/admin/properties", { query }),

  getRentals: (query?: AdminRentalQuery) =>
    api.getPaginated<AdminBooking>("/admin/rentals", { query }),
};
