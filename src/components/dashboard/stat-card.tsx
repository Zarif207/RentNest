import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/dashboard/bento";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  /** Short context under the number, e.g. "Paid with Stripe". */
  hint?: string;
  isLoading?: boolean;
};

/** Existing overview tiles, now drawn as bento MetricCards. */
export function StatCard(props: StatCardProps) {
  return <MetricCard {...props} />;
}
