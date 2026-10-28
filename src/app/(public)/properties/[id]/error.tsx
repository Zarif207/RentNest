"use client";

import Link from "next/link";
import { House, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <House className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">We couldn&apos;t load this home</h1>
      <p className="mt-3 text-muted-foreground">
        Something went wrong while fetching the listing. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/properties">Browse properties</Link>
        </Button>
      </div>
    </div>
  );
}
