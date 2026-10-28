"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/client";

/** Inline error for a failed query, with a retry button. */
export function QueryError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-3xl border bg-card px-6 py-12 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-secondary">
        <TriangleAlert className="size-6 text-muted-foreground" aria-hidden />
      </span>
      <p className="mt-4 font-semibold">Couldn&apos;t load this data</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <Button variant="outline" className="mt-5" onClick={onRetry}>
        <RotateCcw data-icon="inline-start" /> Try again
      </Button>
    </div>
  );
}
