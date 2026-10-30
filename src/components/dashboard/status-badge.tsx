import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/types";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

// Muted tones from CLAUDE.md: PENDING ochre, APPROVED slate blue, REJECTED
// brick, ACTIVE sage, COMPLETED stone, CANCELLED stone outline. Payments reuse them.
const STATUS_VARIANT: Record<BookingStatus | PaymentStatus, BadgeVariant> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  ACTIVE: "active",
  COMPLETED: "completed",
  PAID: "active",
  FAILED: "rejected",
};

/** Pastel status pill with a leading dot (Aurex style); text carries the meaning. */
export function StatusPill({ status, className }: { status: BookingStatus | PaymentStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn("h-7 gap-1.5 px-3", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {formatEnumLabel(status)}
    </Badge>
  );
}

/** Kept for existing pages; same as StatusPill. */
export const StatusBadge = StatusPill;
