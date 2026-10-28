"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmenity, formatCurrency, formatEnumLabel } from "@/lib/format";
import type { BrowseFilters } from "@/lib/property-filters";
import type { Category } from "@/types";
import { useBrowse } from "./browse-context";

type Chip = { key: string; label: string; clear: Record<string, string | null> };

export function getActiveChips(filters: BrowseFilters, categories: Category[]): Chip[] {
  const chips: Chip[] = [];

  if (filters.searchTerm) {
    chips.push({ key: "searchTerm", label: `“${filters.searchTerm}”`, clear: { searchTerm: null } });
  }
  if (filters.city) chips.push({ key: "city", label: filters.city, clear: { city: null } });
  if (filters.division) {
    chips.push({ key: "division", label: filters.division, clear: { division: null } });
  }
  if (filters.propertyType) {
    chips.push({
      key: "propertyType",
      label: formatEnumLabel(filters.propertyType),
      clear: { propertyType: null },
    });
  }
  if (filters.categoryId) {
    const category = categories.find((item) => item.id === filters.categoryId);
    chips.push({
      key: "categoryId",
      label: category ? category.name : "Category",
      clear: { categoryId: null },
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const label =
      filters.minPrice !== null && filters.maxPrice !== null
        ? `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`
        : filters.minPrice !== null
          ? `From ${formatCurrency(filters.minPrice)}`
          : `Up to ${formatCurrency(filters.maxPrice)}`;
    chips.push({ key: "price", label, clear: { minPrice: null, maxPrice: null } });
  }
  for (const amenity of filters.amenities) {
    const rest = filters.amenities.filter((item) => item !== amenity).join(",");
    chips.push({ key: `amenity-${amenity}`, label: formatAmenity(amenity), clear: { amenities: rest } });
  }
  if (filters.availableOnly) {
    chips.push({ key: "available", label: "Available only", clear: { availabilityStatus: null } });
  }

  return chips;
}

export function ActiveFilters({ categories }: { categories: Category[] }) {
  const { filters, setParams, clearAll } = useBrowse();
  const chips = getActiveChips(filters, categories);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => setParams(chip.clear)}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1.5 pr-2.5 pl-3.5 text-sm font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {chip.label}
          <X className="size-3.5 text-muted-foreground" aria-hidden />
        </button>
      ))}
      <Button variant="link" size="sm" onClick={clearAll} className="px-2">
        Clear all
      </Button>
    </div>
  );
}
