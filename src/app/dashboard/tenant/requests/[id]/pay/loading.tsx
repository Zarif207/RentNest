import { Skeleton } from "@/components/ui/skeleton";

// Order-summary skeleton; also the Suspense boundary for this dynamic route.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading payment…</span>
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="max-w-2xl overflow-hidden rounded-3xl border bg-card">
        <Skeleton className="aspect-21/9 rounded-none" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-13 rounded-full" />
        </div>
      </div>
    </div>
  );
}
