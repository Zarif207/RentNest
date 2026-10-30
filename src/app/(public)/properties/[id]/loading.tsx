import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell width="full" aria-busy="true">
      <span className="sr-only">Loading property…</span>
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-14 w-full max-w-3xl" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="mt-8 px-2 sm:px-3">
        <Skeleton className="h-[56svh] min-h-80 w-full rounded-3xl lg:h-[min(70svh,40rem)]" />
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <div className="space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-2xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-104 rounded-3xl" />
      </div>
    </PageShell>
  );
}
