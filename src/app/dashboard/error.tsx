"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card px-6 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <TriangleAlert className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">This page didn&apos;t load</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Something went wrong on our side. Try again, or head back to your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
