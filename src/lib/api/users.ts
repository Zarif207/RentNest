import type { UpdateProfileInput, User } from "@/types";
import { api } from "./client";

export const usersService = {
  updateMe: (input: UpdateProfileInput) => api.patch<User>("/users/me", input),
};
