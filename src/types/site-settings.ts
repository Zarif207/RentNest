import type { PropertyType } from "./enums";
import type { PropertyWithRelations } from "./property";

/** GET /properties/states: every state that has listings, busiest first. */
export type PropertyStateCount = {
  state: string;
  propertyCount: number;
  availableCount: number;
};

export const HOMEPAGE_SECTIONS = [
  "statement",
  "stats",
  "featured",
  "states",
  "propertyTypes",
  "latest",
  "howItWorks",
  "whyUs",
  "reviews",
  "faq",
] as const;

export type HomepageSection = (typeof HOMEPAGE_SECTIONS)[number];

/** GET /site-settings/homepage: the admin's homepage config, resolved for rendering. */
export type HomepageSettings = {
  hero: { properties: PropertyWithRelations[] };
  featured: { enabled: boolean; title: string | null; properties: PropertyWithRelations[] };
  states: {
    enabled: boolean;
    items: {
      state: string;
      imageUrl: string;
      propertyCount: number;
      /** Lowest available rent (Prisma Decimal as a string), or null. */
      startingPrice: string | null;
    }[];
  };
  propertyTypes: {
    enabled: boolean;
    items: { type: PropertyType; imageUrl: string | null; propertyCount: number }[];
  };
  latest: { enabled: boolean; count: number; properties: PropertyWithRelations[] };
  sectionOrder: HomepageSection[];
  /** True until an admin saves a config (defaults are shown). */
  isDefault: boolean;
  updatedAt: string | null;
};
