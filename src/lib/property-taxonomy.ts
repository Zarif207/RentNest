import {
  Building,
  Building2,
  Gem,
  GraduationCap,
  House,
  type LucideIcon,
  Mountain,
  ShieldCheck,
  Sofa,
  Tag,
  DoorOpen,
  TrendingUp,
  UsersRound,
  Waves,
  BedSingle,
} from "lucide-react";
import type { PropertyType } from "@/types";

/**
 * Two different questions about a listing:
 * - Property type is the building (an enum): what it is.
 * - Category is the market segment, set by admins: how it is positioned.
 */
export const PROPERTY_TYPE_HINT = "What the building is";
export const CATEGORY_HINT = "How it is positioned";

export const PROPERTY_TYPE_ICONS: Record<PropertyType, LucideIcon> = {
  APARTMENT: Building2,
  HOUSE: House,
  VILLA: Building,
  STUDIO: BedSingle,
};

// Matched on words in the admin-chosen name, so renamed or new categories
// still get a fitting icon (and a neutral tag otherwise).
const CATEGORY_ICON_RULES: [RegExp, LucideIcon][] = [
  [/luxury|premium/i, Gem],
  [/family/i, UsersRound],
  [/furnished|serviced/i, Sofa],
  [/gated|compound/i, ShieldCheck],
  [/water|beach|lake|sea/i, Waves],
  [/student|shared/i, GraduationCap],
  [/chalet|istiraha|rest house|cabin/i, Mountain],
  [/invest/i, TrendingUp],
  [/residential/i, DoorOpen],
];

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? Tag;
}
