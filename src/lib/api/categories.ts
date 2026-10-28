import type { Category, CategoryInput } from "@/types";
import { api } from "./client";

export const categoriesService = {
  getAll: () => api.get<Category[]>("/categories"),

  // Admin only
  create: (input: CategoryInput) => api.post<Category>("/categories", input),

  update: (id: string, input: CategoryInput) =>
    api.put<Category>(`/categories/${id}`, input),

  remove: (id: string) => api.delete<null>(`/categories/${id}`),
};
