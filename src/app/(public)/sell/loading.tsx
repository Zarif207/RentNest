import { Skeleton } from "@/components/ui/skeleton";

// /sell skeleton: the dark photo hero and the three steps.
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="flex min-h-[86svh] items-end rounded-3xl bg-[#12100e]">
          <div className="mx-auto w-full max-w-7xl space-y-5 px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-24 w-full max-w-3xl rounded-3xl bg-white/10" />
            <Skeleton className="h-12 w-56 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-24 sm:px-6 md:grid-cols-3 lg:px-8">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
