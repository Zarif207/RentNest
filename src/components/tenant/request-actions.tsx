"use client";

import Link from "next/link";
import { CreditCard, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BookingWithProperty } from "@/types";

/** Row actions for a tenant's rental request, based on its status. */
export function RequestActions({ rental }: { rental: BookingWithProperty }) {
  const status = rental.bookingStatus;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "APPROVED" && (
        <Button asChild size="sm">
          <Link href={`/dashboard/tenant/requests/${rental.id}/pay`}>
            <CreditCard data-icon="inline-start" /> Pay Now
          </Link>
        </Button>
      )}
      {(status === "ACTIVE" || status === "COMPLETED") && (
        // The review dialog is added in step 16.
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Reviews are coming soon")}
        >
          <Star data-icon="inline-start" /> Leave Review
        </Button>
      )}
      <Button asChild size="sm" variant="ghost">
        <Link href={`/properties/${rental.propertyId}`}>
          <Eye data-icon="inline-start" /> View property
        </Link>
      </Button>
    </div>
  );
}
