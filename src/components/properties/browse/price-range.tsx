"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from "@/lib/property-filters";
import { useBrowse } from "./browse-context";

type Range = [number, number];

function toRange(min: number | null, max: number | null): Range {
  return [min ?? PRICE_MIN, max ?? PRICE_MAX];
}

/** Two number inputs and a two-thumb slider; commits on release, blur or Enter. */
export function PriceRange() {
  const { filters, setParams } = useBrowse();
  const urlRange = toRange(filters.minPrice, filters.maxPrice);
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
        aria-label="Monthly rent range"
      />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input className="pl-6" {...inputProps(0, "Minimum monthly rent")} />
        </div>
        <span className="text-muted-foreground">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input className="pl-6" {...inputProps(1, "Maximum monthly rent")} />
        </div>
      </div>
    </div>
  );
}
