import type { Favorite, FavoriteWithProperty } from "@/types";
import { api } from "./client";

export const favoritesService = {
  /** The tenant's saved homes, newest first. */
  getMine: () =>
    api.getPaginated<FavoriteWithProperty>("/favorites", { query: { limit: 100, sortOrder: "desc" } }),

  /** Just the saved property ids, to fill the hearts. */
  getIds: () => api.get<string[]>("/favorites/ids"),

  /** Idempotent: saving an already-saved home is fine. */
  add: (propertyId: string) => api.post<Favorite>("/favorites", { propertyId }),

  /** Idempotent: removing a home that isn't saved is fine. */
  remove: (propertyId: string) =>
    api.delete<{ removed: boolean }>(`/favorites/${encodeURIComponent(propertyId)}`),
};
