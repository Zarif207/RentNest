import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="space-y-5" aria-hidden>
      {Array.from({ length: fields }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-2xl" />
      ))}
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}
