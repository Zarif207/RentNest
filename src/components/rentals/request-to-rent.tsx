"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Loader2 } from "lucide-react";
import { RequestRentDialog } from "@/components/rentals/request-rent-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { TENANT_REQUESTS_PATH } from "@/hooks/use-rentals";
import type { AvailabilityStatus } from "@/types";

type RequestToRentProps = {
  property: {
    id: string;
    title: string;
    rentAmount: string;
    availabilityStatus: AvailabilityStatus;
  };
};

const buttonClass = "h-13 w-full text-base";

/** Disabled button with a reason: tooltip on hover/focus, plain text for touch. */
function DisabledRequest({ reason }: { reason: string }) {
  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Disabled buttons get no pointer events, so the wrapper holds the tooltip. */}
          <span tabIndex={0} className="block rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Button size="lg" className={buttonClass} disabled>
              Request to Rent
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
      <p className="text-center text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}

export function RequestToRent({ property }: RequestToRentProps) {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  if (property.availabilityStatus !== "AVAILABLE") {
    return <DisabledRequest reason="Currently rented" />;
  }

  if (isLoading) {
    return (
      <Button size="lg" className={buttonClass} disabled>
        <Loader2 className="animate-spin" aria-hidden /> Request to Rent
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild size="lg" className={buttonClass}>
        <Link href={`/auth/login?redirect=${encodeURIComponent(`/properties/${property.id}`)}`}>
          Request to Rent
        </Link>
      </Button>
    );
  }

  if (user.role !== "TENANT") {
    return <DisabledRequest reason="Only tenants can request" />;
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className={buttonClass} onClick={() => setOpen(true)}>
        {sent ? "Request another lease" : "Request to Rent"}
      </Button>
      {sent && (
        <p className="flex items-center justify-center gap-2 text-sm">
          <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Request sent.
          <Link href={TENANT_REQUESTS_PATH} className="font-medium underline underline-offset-4">
            View my requests
          </Link>
        </p>
      )}
      <RequestRentDialog
        open={open}
        onOpenChange={setOpen}
        property={property}
        onSent={() => setSent(true)}
      />
    </div>
  );
}
