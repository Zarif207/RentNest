"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveChips } from "@/lib/property-filters";
import { cn } from "@/lib/utils";
import { useBrowse } from "./browse-context";
import { PropertyFilters, type FilterOptions } from "./property-filters";

/**
 * Desktop filter column. Sticky just under the floating navbar and capped to
 * the viewport, so it scrolls on its own (never with the page) and long
 * result lists can't make it jump. The scrollbar shows on hover only; soft
 * fades at the top/bottom appear when there's more to scroll. "Clear all"
 * stays pinned at the bottom.
 */
export function FilterSidebar(options: FilterOptions) {
  const { filters, clearAll } = useBrowse();
  const activeCount = getActiveChips(filters, options.categories).length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      top: el.scrollTop > 4,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4,
    });
  }, []);

  // Re-measure when sections expand/collapse or the window resizes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [measure]);

  const mask = `linear-gradient(to bottom, ${edges.top ? "transparent" : "black"}, black 28px, black calc(100% - 28px), ${edges.bottom ? "transparent" : "black"})`;

  return (
    <div className="sticky top-22 flex max-h-[calc(100svh-7rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
        <p className="flex items-center gap-2 font-medium">
          <SlidersHorizontal className="size-4" aria-hidden /> Filters
        </p>
        {activeCount > 0 && (
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-bronze">
            {activeCount} active
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={measure}
        // Lenis smooth-scrolls the page; let the wheel scroll this list natively.
        data-lenis-prevent
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 scrollbar-thin [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--color-border)_transparent] focus-within:[scrollbar-color:var(--color-border)_transparent]"
      >
        <PropertyFilters {...options} />
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="outline"
          className={cn("w-full", activeCount === 0 && "text-muted-foreground")}
          onClick={clearAll}
          disabled={activeCount === 0}
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
