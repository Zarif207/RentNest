"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveChips } from "@/lib/property-filters";
import type { Category } from "@/types";
import { useBrowse } from "./browse-context";

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
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 py-1.5 pr-2.5 pl-3.5 text-sm font-medium text-bronze transition-colors outline-none hover:bg-gold/25 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      <Button variant="link" size="sm" onClick={clearAll} className="px-2">
        Clear all
      </Button>
    </div>
  );
}
