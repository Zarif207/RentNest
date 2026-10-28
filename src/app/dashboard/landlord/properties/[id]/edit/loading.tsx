import { Skeleton } from "@/components/ui/skeleton";

// Form skeleton; also the Suspense boundary for this dynamic route.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading property…</span>
      <Skeleton className="h-9 w-64" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-56 rounded-3xl" />
      ))}
    </div>
  );
}
