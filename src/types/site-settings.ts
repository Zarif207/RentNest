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

export type ListingStats = { count: number; startingPrice: string | null };

/** GET /site-settings/homepage: the admin's homepage config, resolved for rendering. */
export type HomepageSettings = {
  hero: { properties: PropertyWithRelations[] };
  featured: { enabled: boolean; title: string | null; properties: PropertyWithRelations[] };
  states: {
    enabled: boolean;
    items: {
      state: string;
      imageUrl: string;
      /** Same as rent.count / rent.startingPrice (kept for older clients). */
      propertyCount: number;
      startingPrice: string | null;
      /** Available listings of each type, with the lowest price (Decimal string) or null. */
      rent: ListingStats;
      sale: ListingStats;
    }[];
  };
  propertyTypes: {
    enabled: boolean;
    items: {
      type: PropertyType;
      imageUrl: string | null;
      /** Both listing types. */
      propertyCount: number;
      rentCount: number;
      saleCount: number;
    }[];
  };
  latest: { enabled: boolean; count: number; properties: PropertyWithRelations[] };
  sectionOrder: HomepageSection[];
  /** True until an admin saves a config (defaults are shown). */
  isDefault: boolean;
  updatedAt: string | null;
};

/** The raw homepage config the admin edits (ids, not properties). */
export type HomepageConfig = {
  hero: { propertyIds: string[] };
  featured: { enabled: boolean; title?: string; propertyIds: string[] };
  states: { enabled: boolean; items: { state: string; imageUrl: string }[] };
  propertyTypes: { enabled: boolean; items: { type: PropertyType; imageUrl?: string }[] };
  latest: { enabled: boolean; count: number };
  sectionOrder: HomepageSection[];
};

/** GET/PUT /admin/site-settings/homepage. */
export type HomepageConfigResponse = {
  config: HomepageConfig;
  isDefault: boolean;
  updatedAt: string | null;
};
