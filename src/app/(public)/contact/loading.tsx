import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 lg:px-8" aria-busy="true">
      <span className="sr-only">Loading contact page…</span>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-72" />
          <Skeleton className="h-6 w-full max-w-md" />
          <Skeleton className="mt-6 h-56 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-130 w-full rounded-3xl" />
      </div>
    </div>
  );
}
