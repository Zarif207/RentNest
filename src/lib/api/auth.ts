import type { LoginInput, LoginResult, RegisterInput, User } from "@/types";
import { api } from "./client";

export const authService = {
  /** Returns the created user; register does not issue a token. */
  register: (input: RegisterInput) => api.post<User>("/auth/register", input),

  login: (input: LoginInput) => api.post<LoginResult>("/auth/login", input),

  getMe: (token?: string) => api.get<User>("/auth/me", { token }),
};
