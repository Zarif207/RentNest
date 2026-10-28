import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import type { BookingStatus, PaymentStatus } from "@/types";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

// Colors from CLAUDE.md: PENDING amber, APPROVED blue, REJECTED red,
// ACTIVE green, COMPLETED gray, CANCELLED gray outline. Payments reuse them.
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

export function StatusBadge({ status }: { status: BookingStatus | PaymentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{formatEnumLabel(status)}</Badge>;
}
