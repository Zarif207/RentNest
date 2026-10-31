import { Badge } from "@/components/ui/badge";
import { OFFER_STATUS_LABELS } from "@/lib/offers";
import { cn } from "@/lib/utils";
import type { OfferStatus } from "@/types";

// Same muted palette as rental statuses: waiting ochre, counter slate, a
// deal (accepted / deposit paid) sage, closed stone, declined brick.
const VARIANT = {
  PENDING: "pending",
  COUNTERED: "approved",
  ACCEPTED: "gold",
  DEPOSIT_PAID: "active",
  COMPLETED: "completed",
  REJECTED: "rejected",
  WITHDRAWN: "cancelled",
  EXPIRED: "cancelled",
} as const satisfies Record<OfferStatus, string>;

export function OfferStatusPill({ status, className }: { status: OfferStatus; className?: string }) {
  return (
    <Badge variant={VARIANT[status]} className={cn("h-7 gap-1.5 px-3", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {OFFER_STATUS_LABELS[status]}
    </Badge>
  );
}
