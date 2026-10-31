import type { MapProperty, PropertyQuery, PropertyStateCount, PropertyWithRelations } from "@/types";
import { api } from "./client";

export const propertiesService = {
  getAll: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/properties", { query }),

  /** Pins for every property with coordinates (not paginated, at most 1000). */
  getMap: () => api.get<MapProperty[]>("/properties/map"),

  /** Every state that has listings, with counts (busiest first). */
  getStates: () => api.get<PropertyStateCount[]>("/properties/states"),

  getById: (id: string) =>
    api.get<PropertyWithRelations>(`/properties/${encodeURIComponent(id)}`),
};
