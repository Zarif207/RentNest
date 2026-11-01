"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { RejectListingDialog } from "@/components/admin/reject-listing-dialog";
import { Button } from "@/components/ui/button";
import { useReviewProperty } from "@/hooks/use-admin";
import type { PropertyWithRelations } from "@/types";

/**
 * Approve and reject for the admin's listing table and preview page. Approve
 * applies at once (optimistic, rolled back on error); Reject first asks for
 * the reason the landlord will see.
 */
export function useListingReview() {
  const review = useReviewProperty();
  const [rejecting, setRejecting] = useState<PropertyWithRelations | null>(null);

  const isBusy = (property: PropertyWithRelations) =>
    review.isPending && review.variables?.property.id === property.id;

  const dialog = (
    <RejectListingDialog
      property={rejecting}
      onOpenChange={(open) => !open && setRejecting(null)}
      isPending={review.isPending && review.variables?.input.status === "REJECTED"}
      onSubmit={(property, note) =>
        review.mutate({ property, input: { status: "REJECTED", note } }, { onSettled: () => setRejecting(null) })
      }
    />
  );

  return {
    approve: (property: PropertyWithRelations) => review.mutate({ property, input: { status: "APPROVED" } }),
    reject: setRejecting,
    isBusy,
    dialog,
  };
}

/**
 * Approve (pending or rejected listings) and Reject (pending only), the moves
 * the API allows.
 */
export function ListingReviewButtons({
  property,
  review,
  size = "sm",
}: {
  property: PropertyWithRelations;
  review: ReturnType<typeof useListingReview>;
  size?: "sm" | "default";
}) {
  if (property.reviewStatus === "APPROVED") return null;
  const busy = review.isBusy(property);
  return (
    <>
      <Button size={size} disabled={busy} onClick={() => review.approve(property)}>
        <Check data-icon="inline-start" /> Approve
        <span className="sr-only"> {property.title}</span>
      </Button>
      {property.reviewStatus === "PENDING" && (
        <Button size={size} variant="outline" disabled={busy} onClick={() => review.reject(property)}>
          <X data-icon="inline-start" /> Reject
          <span className="sr-only"> {property.title}</span>
        </Button>
      )}
    </>
  );
}
