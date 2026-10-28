import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  /** Short context under the number, e.g. "Paid with Stripe". */
  hint?: string;
  isLoading?: boolean;
};

export function StatCard({ label, value, icon: Icon, hint, isLoading }: StatCardProps) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-full bg-secondary">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-24" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
