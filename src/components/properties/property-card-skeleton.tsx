import { Skeleton } from "@/components/ui/skeleton";

/** Matches PropertyCard's layout so the grid doesn't jump when data arrives. */
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Skeleton className="aspect-4/3 w-full rounded-2xl" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-full" />
        <div className="flex items-end justify-between gap-3 pt-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading properties…</span>
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}
