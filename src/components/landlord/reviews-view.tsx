"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { EmptyState } from "@/components/shared/empty-state";
import { StarRating } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LANDLORD_PROPERTIES_PATH } from "@/hooks/use-landlord-properties";
import { useLandlordReviews } from "@/hooks/use-landlord-reviews";
import { formatDate } from "@/lib/format";

export function LandlordReviewsView() {
  const reviews = useLandlordReviews();
  const list = reviews.data?.data ?? [];
  const total = reviews.data?.meta.total ?? 0;
  const average = list.length ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="What tenants say about your homes." />

      {reviews.isError ? (
        <QueryError error={reviews.error} onRetry={() => void reviews.refetch()} />
      ) : reviews.isPending ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-28 rounded-3xl" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No reviews yet"
          description="Tenants can review a home once their rental is active. Reviews will appear here."
          action={
            <Button asChild variant="outline">
              <Link href={LANDLORD_PROPERTIES_PATH}>View my properties</Link>
            </Button>
          }
          className="bg-card"
        />
      ) : (
        <>
          <div className="flex items-center gap-5 rounded-3xl border bg-card p-6">
            <p className="text-5xl font-semibold tracking-tight">{average.toFixed(1)}</p>
            <div className="space-y-1">
              <StarRating rating={average} className="text-lg" />
              <p className="text-sm text-muted-foreground">
                Average across {total} {total === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <ul className="space-y-4">
            {list.map((review) => (
              <li key={review.id} className="space-y-3 rounded-3xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={review.user.name} className="size-10" />
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="leading-relaxed text-muted-foreground">{review.comment}</p>
                <Link
                  href={`/properties/${review.property.id}`}
                  className="inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                  {review.property.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
