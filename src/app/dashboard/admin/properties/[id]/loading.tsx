import { Skeleton } from "@/components/ui/skeleton";

// Preview skeleton; also the Suspense boundary for this dynamic route.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading listing…</span>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="aspect-video max-h-[28rem] w-full rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
    </div>
  );
}
