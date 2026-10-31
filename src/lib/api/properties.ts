import type { ListingType, MapProperty, PropertyQuery, PropertyStateCount, PropertyWithRelations } from "@/types";
import { api } from "./client";

export const propertiesService = {
  getAll: (query?: PropertyQuery) =>
    api.getPaginated<PropertyWithRelations>("/properties", { query }),

  /** Pins for every unsold property with coordinates (not paginated, at most 1000). */
  getMap: (listingType?: ListingType) =>
    api.get<MapProperty[]>("/properties/map", { query: { listingType } }),

  /** Every state that has listings (of one type, if given), with counts (busiest first). */
  getStates: (listingType?: ListingType) =>
    api.get<PropertyStateCount[]>("/properties/states", { query: { listingType } }),

  getById: (id: string) =>
    api.get<PropertyWithRelations>(`/properties/${encodeURIComponent(id)}`),
};
