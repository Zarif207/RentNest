import type { PaginationQuery } from "./api";
import type { UserRole, UserStatus } from "./enums";

/** User without the password hash (auth/me, login, register, profile). */
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  userStatus: UserStatus;
  createdAt: string;
  updatedAt: string;
};

/** The owner/tenant subset the backend includes on properties and rentals. */
export type UserSummary = Pick<User, "id" | "name" | "email" | "phone">;

/** Returned by PATCH /admin/users/:id. */
export type UserStatusUpdate = Pick<
  User,
  "id" | "name" | "email" | "role" | "userStatus" | "updatedAt"
>;

/** Payload of the access token. */
export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  user: User;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Exclude<UserRole, "ADMIN">;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  phone?: string;
};

export type AdminUserQuery = PaginationQuery<"createdAt" | "name" | "email"> & {
  searchTerm?: string;
  role?: UserRole;
  userStatus?: UserStatus;
};
