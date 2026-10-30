"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatNumber } from "@/lib/format";
import { getActiveChips, SORT_OPTIONS } from "@/lib/property-filters";
import { useBrowse } from "./browse-context";
import { PropertyFilters, type FilterOptions } from "./property-filters";

export function ResultsToolbar({ total, ...options }: FilterOptions & { total: number }) {
  const { filters, setParams, clearAll } = useBrowse();
  const activeCount = getActiveChips(filters, options.categories).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="pl-1 text-sm font-medium" aria-live="polite">
        {formatNumber(total)} {total === 1 ? "property" : "properties"} found
      </p>

      <div className="flex items-center gap-2">
        {/* Below lg the sidebar is hidden; the same filters open in a sheet. */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full lg:hidden">
              <SlidersHorizontal data-icon="inline-start" />
              Filters
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-gold text-xs text-gold-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-full flex-col gap-0 sm:max-w-sm">
            <SheetHeader className="border-b">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Results update as you change filters.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4" data-lenis-prevent>
              <PropertyFilters {...options} />
            </div>
            <SheetFooter className="flex-row border-t">
              <Button variant="outline" className="flex-1" onClick={clearAll} disabled={activeCount === 0}>
                Clear all
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">Show {formatNumber(total)} results</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Select value={filters.sort} onValueChange={(value) => setParams({ sort: value === "newest" ? null : value })}>
          <SelectTrigger aria-label="Sort properties" className="w-48 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
