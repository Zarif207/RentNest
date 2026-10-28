"use client";

import Link from "next/link";
import { RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertiesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">We couldn&apos;t load properties</h1>
      <p className="mt-3 text-muted-foreground">
        The listings service didn&apos;t respond. Try again, or start a fresh search.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/properties">Reset filters</Link>
        </Button>
      </div>
    </div>
  );
}
