"use client";

import { useCallback, useId, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { formatAmenity, formatEnumLabel } from "@/lib/format";
import { US_STATES } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES, type Category } from "@/types";
import { useBrowse } from "./browse-context";
import { PriceRange } from "./price-range";
import { PRICE_RANGES } from "@/lib/property-filters";

const ANY = "any";

export type FilterOptions = {
  categories: Category[];
  amenities: string[];
};

/**
 * One collapsible filter group. Collapsing animates the height (grid rows);
 * a collapsed group with active filters shows how many are set.
 */
function FilterSection({
  title,
  activeCount = 0,
  defaultOpen = true,
  children,
}: {
  title: string;
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 py-4 text-left text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:text-foreground"
        >
          <span className="flex items-center gap-2">
            {title}
            {!open && activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] tracking-normal text-gold-foreground">
                {activeCount}
                <span className="sr-only"> active</span>
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden
            className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
          />
        </button>
      </h3>
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* inert while collapsed, so hidden controls can't be tabbed to. */}
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className="space-y-3 pb-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Filters update the results live (URL params); there's no Apply button. */
export function PropertyFilters({ categories, amenities }: FilterOptions) {
  const { listingType, filters, setParams } = useBrowse();
  const id = useId();

  const commitSearch = useCallback((value: string) => setParams({ searchTerm: value }), [setParams]);
  const commitCity = useCallback((value: string) => setParams({ city: value }), [setParams]);

  const toggleAmenity = (amenity: string, checked: boolean) => {
    const next = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter((item) => item !== amenity);
    setParams({ amenities: next.join(",") });
  };

  const priceActive = filters.minPrice !== null || filters.maxPrice !== null;

  return (
    <div>
      <FilterSection title="Keyword" activeCount={filters.searchTerm ? 1 : 0}>
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

      <FilterSection title="Location" activeCount={Number(Boolean(filters.city)) + Number(Boolean(filters.division))}>
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

      <FilterSection title="Property type" activeCount={filters.propertyType ? 1 : 0}>
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

      <FilterSection title="Category" activeCount={filters.categoryId ? 1 : 0}>
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

      {/* One price scale per listing type, so browsing both has no price filter. */}
      {listingType ? (
        <FilterSection title={PRICE_RANGES[listingType].title} activeCount={priceActive ? 1 : 0}>
          <PriceRange listingType={listingType} />
        </FilterSection>
      ) : (
        <FilterSection title="Price">
          <p className="text-sm text-muted-foreground">
            Rent and sale prices use different scales. Pick Rent or Buy above to filter by price.
          </p>
        </FilterSection>
      )}

      <FilterSection title="Amenities" activeCount={filters.amenities.length} defaultOpen={filters.amenities.length > 0}>
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

      <FilterSection title="Availability" activeCount={filters.availableOnly ? 1 : 0}>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${id}-available`} className="flex-col items-start gap-0.5">
            <span>Available only</span>
            <span className="text-xs font-normal text-muted-foreground">
              {listingType === "RENT"
                ? "Hide rented homes"
                : listingType === "SALE"
                  ? "Hide homes under contract"
                  : "Hide rented and under-contract homes"}
            </span>
          </Label>
          <Switch
            id={`${id}-available`}
            checked={filters.availableOnly}
            onCheckedChange={(checked) => setParams({ availabilityStatus: checked ? "AVAILABLE" : null })}
          />
        </div>
      </FilterSection>
    </div>
  );
}
