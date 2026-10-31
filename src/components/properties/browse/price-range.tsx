"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PRICE_MIN, PRICE_RANGES } from "@/lib/property-filters";
import type { ListingType } from "@/types";
import { useBrowse } from "./browse-context";

type Range = [number, number];

/**
 * Two number inputs and a two-thumb slider; commits on release, blur or Enter.
 * Bounds and steps follow the listing type (monthly rent or sale price); the
 * top of the slider means "no maximum".
 */
export function PriceRange({ listingType }: { listingType: ListingType }) {
  const { filters, setParams } = useBrowse();
  const { max: PRICE_MAX, step: PRICE_STEP, noun } = PRICE_RANGES[listingType];
  const urlRange: Range = [filters.minPrice ?? PRICE_MIN, filters.maxPrice ?? PRICE_MAX];
  const [range, setRange] = useState<Range>(urlRange);
  const [seen, setSeen] = useState(urlRange.join("-"));

  // Follow outside changes (chip removed, back button).
  if (urlRange.join("-") !== seen) {
    setSeen(urlRange.join("-"));
    setRange(urlRange);
  }

  const commit = ([min, max]: Range) => {
    const low = Math.max(PRICE_MIN, Math.min(min, max));
    const high = Math.min(PRICE_MAX, Math.max(min, max));
    setRange([low, high]);
    setParams({
      minPrice: low > PRICE_MIN ? String(low) : null,
      maxPrice: high < PRICE_MAX ? String(high) : null,
    });
  };

  const inputProps = (index: 0 | 1, label: string) => ({
    type: "number",
    inputMode: "numeric" as const,
    min: PRICE_MIN,
    max: PRICE_MAX,
    step: PRICE_STEP,
    "aria-label": label,
    value: range[index],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const next: Range = [...range];
      next[index] = Number(event.target.value) || 0;
      setRange(next);
    },
    onBlur: () => commit(range),
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") commit(range);
    },
  });

  return (
    <div className="space-y-4">
      <Slider
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={range}
        onValueChange={(value) => setRange([value[0], value[1]])}
        onValueCommit={(value) => commit([value[0], value[1]])}
        aria-label={`${noun[0].toUpperCase()}${noun.slice(1)} range`}
      />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input className="pl-6" {...inputProps(0, `Minimum ${noun}`)} />
        </div>
        <span className="text-muted-foreground">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input className="pl-6" {...inputProps(1, `Maximum ${noun}`)} />
        </div>
      </div>
    </div>
  );
}
