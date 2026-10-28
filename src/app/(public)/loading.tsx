import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Home page skeleton: hero, search bar and the featured grid.
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="bg-linear-to-b from-sky-from to-sky-to pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
            <Skeleton className="h-14 w-full max-w-xl rounded-2xl bg-background/60" />
            <Skeleton className="h-6 w-full max-w-md bg-background/60" />
          </div>
          <Skeleton className="mt-12 h-[340px] rounded-3xl bg-background/60 sm:h-[460px] lg:h-[540px]" />
          <Skeleton className="relative mx-auto -mt-10 h-16 max-w-4xl rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-full max-w-lg" />
        <PropertyGridSkeleton />
      </div>
    </div>
  );
}
