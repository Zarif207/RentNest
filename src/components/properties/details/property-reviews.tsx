import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StarRating } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { ReviewWithUser } from "@/types";

export function PropertyReviews({ reviews }: { reviews: ReviewWithUser[] | null }) {
  if (reviews === null) {
    return (
      <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
        Reviews couldn&apos;t be loaded right now. Please refresh to try again.
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="No reviews yet"
        description="Tenants can review this home once their rental is active. Check back soon."
        action={
          <Button asChild variant="outline">
            <Link href="/properties">Browse other homes</Link>
          </Button>
        }
      />
    );
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl bg-surface p-5">
        <p className="text-5xl font-semibold tracking-tight">{average.toFixed(1)}</p>
        <div className="space-y-1">
          <StarRating rating={average} className="text-lg" />
          <p className="text-sm text-muted-foreground">
            Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <ul className="divide-y">
        {reviews.map((review) => (
          <li key={review.id} className="py-5 first:pt-0">
            <div className="flex items-center gap-3">
              <UserAvatar name={review.user.name} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{review.user.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-3 leading-relaxed text-muted-foreground">{review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
