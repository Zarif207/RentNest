import type { PropertyQuery, PropertyStateCount, PropertyWithRelations } from "@/types";
import { api } from "./client";

export const propertiesService = {
  getAll: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/properties", { query }),

  /** Every state that has listings, with counts (busiest first). */
  getStates: () => api.get<PropertyStateCount[]>("/properties/states"),

  getById: (id: string) =>
    api.get<PropertyWithRelations>(`/properties/${encodeURIComponent(id)}`),
};
