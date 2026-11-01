"use client";

import Link from "next/link";
import { SearchX, TriangleAlert } from "lucide-react";
import { ApprovalGate } from "@/components/landlord/approval";
import { PropertyForm } from "@/components/landlord/property-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LANDLORD_PROPERTIES_PATH, useProperty } from "@/hooks/use-landlord-properties";
import { isApiError } from "@/lib/api/client";

export function EditPropertyView({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const property = useProperty(propertyId);

  if (property.isPending || !user) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-3xl" />
        ))}
      </div>
    );
  }

  const missing = property.isError && isApiError(property.error) && [400, 404].includes(property.error.status);
  if (property.isError && !missing) {
    return <QueryError error={property.error} onRetry={() => void property.refetch()} />;
  }

  // The backend also refuses edits by anyone but the owner (403).
  if (missing || property.data?.ownerId !== user.id) {
    return (
      <EmptyState
        icon={SearchX}
        title="Property not found"
        description="This listing doesn't exist or belongs to another landlord."
        action={
          <Button asChild variant="outline">
            <Link href={LANDLORD_PROPERTIES_PATH}>Back to my properties</Link>
          </Button>
        }
        className="bg-card"
      />
    );
  }

  return (
    <ApprovalGate>
      <div className="space-y-6">
        <PageHeader title="Edit property" description={property.data.title} />
        {property.data.reviewStatus === "REJECTED" && (
          <div role="status" className="flex items-start gap-3 rounded-3xl border border-destructive/25 bg-destructive/5 px-5 py-4 text-sm">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">Fix the issues and save to resubmit.</p>
              {property.data.reviewNote && (
                <p className="whitespace-pre-line text-muted-foreground">
                  <span className="font-medium text-foreground">Admin&apos;s note:</span> {property.data.reviewNote}
                </p>
              )}
            </div>
          </div>
        )}
        {/* key: start a fresh form if the listing is refetched with new data. */}
        <PropertyForm key={property.data.updatedAt} property={property.data} />
      </div>
    </ApprovalGate>
  );
}
