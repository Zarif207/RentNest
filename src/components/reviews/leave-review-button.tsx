"use client";

import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { Button } from "@/components/ui/button";
import { usePropertyReviews } from "@/hooks/use-reviews";
import type { BookingWithProperty } from "@/types";

type LeaveReviewButtonProps = {
  rental: Pick<BookingWithProperty, "id" | "property">;
  size?: "sm" | "default";
  className?: string;
};

/**
 * "Leave Review" for an ACTIVE/COMPLETED rental. The rentals API doesn't say
 * whether a rental was reviewed, so we check the property's reviews for one
 * linked to this booking and show "Reviewed" instead.
 */
export function LeaveReviewButton({ rental, size = "sm", className }: LeaveReviewButtonProps) {
  const [open, setOpen] = useState(false);
  const reviews = usePropertyReviews(rental.property.id);

  // Wait for the check so the button doesn't flash for already-reviewed stays.
  if (reviews.isPending) return null;

  if (reviews.data?.some((review) => review.bookingId === rental.id)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 text-sm text-muted-foreground">
        <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
        Reviewed
      </span>
    );
  }

  return (
    <>
      <Button size={size} variant="outline" className={className} onClick={() => setOpen(true)}>
        <Star data-icon="inline-start" /> Leave Review
      </Button>
      <ReviewDialog
        open={open}
        onOpenChange={setOpen}
        property={{ id: rental.property.id, title: rental.property.title }}
      />
    </>
  );
}
