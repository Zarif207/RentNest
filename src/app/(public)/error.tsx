"use client";

import Link from "next/link";
import { CloudOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <CloudOff className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
