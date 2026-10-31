import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for the home sections below the hero: a heading and the featured grid. */
export function HomeSectionsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <Skeleton className="h-12 w-full max-w-lg" />
      <PropertyGridSkeleton />
    </div>
  );
}
