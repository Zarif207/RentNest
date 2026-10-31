import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell aria-busy="true">
      <span className="sr-only">Loading properties…</span>
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-xl" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-20 w-36" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[17.5rem_1fr]">
        <div className="hidden space-y-6 rounded-3xl border border-border bg-card p-5 lg:block">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-border p-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
          <PropertyGridSkeleton />
        </div>
      </div>
    </PageShell>
  );
}
