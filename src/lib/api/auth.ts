import type { LoginInput, LoginResult, RegisterInput, User } from "@/types";
import { api, type MethodOptions } from "./client";

export const authService = {
  /** Returns the created user; register does not issue a token. */
  register: (input: RegisterInput) =>
    api.post<User>("/auth/register", input, { skipSessionHandling: true }),

  login: (input: LoginInput) =>
    api.post<LoginResult>("/auth/login", input, { skipSessionHandling: true }),

  getMe: (options?: MethodOptions) => api.get<User>("/auth/me", options),
};
