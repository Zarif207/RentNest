import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading about page…</span>
      <div data-full-bleed className="flex h-[88svh] min-h-152 items-end bg-[#12100e]">
        <div className="mx-auto w-full max-w-7xl space-y-5 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <Skeleton className="h-4 w-36 bg-white/10" />
          <Skeleton className="h-20 w-full max-w-4xl bg-white/10" />
          <Skeleton className="h-20 w-2/3 max-w-2xl bg-white/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-full max-w-md" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="aspect-4/5 w-full rounded-3xl lg:aspect-5/6" />
      </div>
    </div>
  );
}
