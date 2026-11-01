import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/types";

export const REVIEW_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Live",
  REJECTED: "Rejected",
};

// Amber, green and red, in the muted status tones.
const VARIANTS = {
  PENDING: "pending",
  APPROVED: "active",
  REJECTED: "rejected",
} as const satisfies Record<ReviewStatus, string>;

/** Where a listing stands with the admins: "Pending review", "Live" or "Rejected". */
export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  return (
    <Badge variant={VARIANTS[status]} className={className}>
      {REVIEW_LABELS[status]}
    </Badge>
  );
}

/** The dashboard preview for a listing that isn't public yet; approved ones use the public page. */
export function listingHref(
  property: { id: string; reviewStatus: ReviewStatus },
  previewBase: "/dashboard/admin/properties" | "/dashboard/landlord/properties",
) {
  return property.reviewStatus === "APPROVED" ? `/properties/${property.id}` : `${previewBase}/${property.id}`;
}
