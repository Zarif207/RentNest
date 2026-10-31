import type { Paginated, PropertyWithRelations } from "@/types";

export type LiveStat = {
  value: number;
  label: string;
  description: string;
};

/**
 * Platform numbers, only the ones we can count truthfully: totals come from
 * `meta.total`; cities and landlords only when every listing was fetched.
 */
export function toLiveStats(
  all: Paginated<PropertyWithRelations> | null,
  available: Paginated<PropertyWithRelations> | null,
): LiveStat[] {
  const stats: LiveStat[] = [];
  if (all) {
    stats.push({ value: all.meta.total, label: "Homes listed", description: "To rent and to buy, from studios to villas." });
  }
  if (available) {
    stats.push({ value: available.meta.total, label: "Available now", description: "Ready to request or make an offer on today." });
  }
  if (all && all.data.length === all.meta.total) {
    const cities = new Set(all.data.map((property) => `${property.city}|${property.division}`));
    const landlords = new Set(all.data.map((property) => property.ownerId));
    stats.push({ value: cities.size, label: "Cities covered", description: "Across different US states." });
    stats.push({ value: landlords.size, label: "Landlords and owners", description: "Each one managing their own homes." });
  }
  return stats;
}
