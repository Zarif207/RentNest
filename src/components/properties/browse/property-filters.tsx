"use client";

import { useCallback, useId } from "react";
import { Search } from "lucide-react";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatAmenity, formatEnumLabel } from "@/lib/format";
import { US_STATES } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES, type Category } from "@/types";
import { useBrowse } from "./browse-context";
import { PriceRange } from "./price-range";

const ANY = "any";

export type FilterOptions = {
  categories: Category[];
  amenities: string[];
};

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function PropertyFilters({ categories, amenities }: FilterOptions) {
  const { filters, setParams } = useBrowse();
  const id = useId();

  const commitSearch = useCallback((value: string) => setParams({ searchTerm: value }), [setParams]);
  const commitCity = useCallback((value: string) => setParams({ city: value }), [setParams]);

  const toggleAmenity = (amenity: string, checked: boolean) => {
    const next = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter((item) => item !== amenity);
    setParams({ amenities: next.join(",") });
  };

  return (
    <div className="space-y-6">
      <FilterSection title="Keyword">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <DebouncedInput
            type="search"
            aria-label="Search properties"
            placeholder="Title, address, description…"
            className="pl-9"
            value={filters.searchTerm}
            onCommit={commitSearch}
          />
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <DebouncedInput
          aria-label="City"
          placeholder="City, e.g. Austin"
          value={filters.city}
          onCommit={commitCity}
        />
        <Select
          value={filters.division || ANY}
          onValueChange={(value) => setParams({ division: value === ANY ? null : value })}
        >
          <SelectTrigger aria-label="State" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any state</SelectItem>
            {US_STATES.map((state) => (
              <SelectItem key={state.code} value={state.name}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <Separator />

      <FilterSection title="Property type">
        <div className="flex flex-wrap gap-2">
          {[null, ...PROPERTY_TYPES].map((type) => {
            const active = filters.propertyType === type;
            return (
              <button
                key={type ?? ANY}
                type="button"
                aria-pressed={active}
                onClick={() => setParams({ propertyType: type })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "hover:bg-secondary",
                )}
              >
                {type ? formatEnumLabel(type) : "Any"}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <Select
          value={filters.categoryId ?? ANY}
          onValueChange={(value) => setParams({ categoryId: value === ANY ? null : value })}
        >
          <SelectTrigger aria-label="Category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <Separator />

      <FilterSection title="Monthly rent">
        <PriceRange />
      </FilterSection>

      <Separator />

      <FilterSection title="Amenities">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-1">
          {amenities.map((amenity) => {
            const checkboxId = `${id}-amenity-${amenity}`;
            return (
              <li key={amenity} className="flex items-center gap-2.5">
                <Checkbox
                  id={checkboxId}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => toggleAmenity(amenity, checked === true)}
                />
                <Label htmlFor={checkboxId} className="font-normal">
                  {formatAmenity(amenity)}
                </Label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-available`} className="flex-col items-start gap-0.5">
          <span>Available only</span>
          <span className="text-xs font-normal text-muted-foreground">Hide rented homes</span>
        </Label>
        <Switch
          id={`${id}-available`}
          checked={filters.availableOnly}
          onCheckedChange={(checked) => setParams({ availabilityStatus: checked ? "AVAILABLE" : null })}
        />
      </div>
    </div>
  );
}
