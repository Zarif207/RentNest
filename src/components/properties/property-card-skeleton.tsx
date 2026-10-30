import { Skeleton } from "@/components/ui/skeleton";

/** Matches PropertyCard's layout so the grid doesn't jump when data arrives. */
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl border border-border bg-card p-2" aria-hidden>
      <Skeleton className="aspect-4/3 w-full rounded-2xl" />
      <div className="flex flex-col gap-2 px-3 pt-4 pb-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-2 border-t border-border pt-3.5">
          <Skeleton className="h-5 w-44" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading properties…</span>
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}
