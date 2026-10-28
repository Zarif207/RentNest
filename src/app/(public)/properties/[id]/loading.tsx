import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8" aria-busy="true">
      <span className="sr-only">Loading property…</span>
      <Skeleton className="h-5 w-36" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="mt-8 aspect-16/9 w-full rounded-3xl lg:aspect-21/9" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-18 rounded-2xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[26rem] rounded-3xl" />
      </div>
    </div>
  );
}
