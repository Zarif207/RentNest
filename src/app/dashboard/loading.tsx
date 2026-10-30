import { Skeleton } from "@/components/ui/skeleton";

// Generic dashboard skeleton, shaped like the bento: header, metric cards, a wide card.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex h-40 flex-col justify-between rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <Skeleton className="h-12 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
