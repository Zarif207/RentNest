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
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr] lg:items-start">
          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <div>
              <p className="text-sm text-muted-foreground">Average rating</p>
              <p className="mt-1 font-serif text-7xl leading-none">{average.toFixed(1)}</p>
              <StarRating rating={average} className="mt-3 text-lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                Across {total} {total === 1 ? "review" : "reviews"}
              </p>
            </div>
            {/* How many reviews gave each star rating. */}
            <dl className="space-y-2 border-t border-border pt-5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const n = list.filter((review) => review.rating === stars).length;
                return (
                  <div key={stars} className="grid grid-cols-[2.5rem_1fr_1.5rem] items-center gap-3 text-sm">
                    <dt className="text-muted-foreground">{stars} ★</dt>
                    <dd className="h-2 overflow-hidden rounded-full bg-foreground/8">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${(n / list.length) * 100}%` }} />
                    </dd>
                    <dd className="text-right tabular-nums">{n}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <ul className="grid gap-4 sm:grid-cols-2">
            {list.map((review) => (
              <li key={review.id}>
                <figure className="flex h-full flex-col gap-5 rounded-3xl border border-border bg-card p-6">
                  <StarRating rating={review.rating} />
                  <blockquote className="flex-1 font-serif text-2xl leading-snug">“{review.comment}”</blockquote>
                  <figcaption className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={review.user.name} className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${review.property.id}`}
                      className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {review.property.title}
                    </Link>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
