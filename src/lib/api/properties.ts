import type { PropertyQuery, PropertyWithRelations } from "@/types";
import { api } from "./client";

export const propertiesService = {
  getAll: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/properties", { query }),

  getById: (id: string) =>
    api.get<PropertyWithRelations>(`/properties/${encodeURIComponent(id)}`),
};
