import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-busy="true">
      <span className="sr-only">Loading properties…</span>
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-12 w-80 max-w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr]">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>
          <PropertyGridSkeleton />
        </div>
      </div>
    </div>
  );
}
