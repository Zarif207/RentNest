import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Home page skeleton: the dark full-screen hero and the featured grid.
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>
      {/* Full-viewport dark hero, matching the real one's frame. */}
      <div data-full-bleed className="relative h-svh min-h-160 bg-[#12100e]">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-end gap-5 px-4 pt-28 pb-20 sm:px-6 md:pb-24 lg:px-8 lg:pb-16">
          <Skeleton className="h-4 w-64 bg-white/10" />
          <Skeleton className="h-24 w-full max-w-2xl rounded-3xl bg-white/10" />
          <Skeleton className="h-6 w-full max-w-md bg-white/10" />
          <Skeleton className="mt-3 h-16 w-full max-w-4xl rounded-full bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-full max-w-lg" />
        <PropertyGridSkeleton />
      </div>
    </div>
  );
}
