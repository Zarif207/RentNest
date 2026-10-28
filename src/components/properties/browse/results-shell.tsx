"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBrowse } from "./browse-context";

/** Keeps the current results visible but dimmed while new ones load. */
export function ResultsShell({ children }: { children: React.ReactNode }) {
  const { isPending } = useBrowse();

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "transition-opacity duration-300",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      {children}
    </div>
  );
}

export function ClearFiltersButton() {
  const { clearAll } = useBrowse();
  return (
    <Button variant="outline" onClick={clearAll}>
      Clear filters
    </Button>
  );
}
