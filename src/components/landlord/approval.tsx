"use client";

import Link from "next/link";
import { Hourglass, Plus, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLandlordAccess } from "@/hooks/use-landlord-access";
import { cn } from "@/lib/utils";

const COPY = {
  PENDING: {
    icon: Hourglass,
    title: "Waiting for admin approval",
    body: "You can't list properties or manage requests yet. Explore your dashboard meanwhile; this updates as soon as an admin approves you.",
  },
  REJECTED: {
    icon: ShieldX,
    title: "Your landlord application was rejected",
    body: "You can't list properties or manage requests. If you think this is a mistake, contact us.",
  },
} as const;

/** Top-of-dashboard banner for a landlord who isn't approved (nothing otherwise). */
export function LandlordStatusBanner() {
  const { status } = useLandlordAccess();
  if (status !== "PENDING" && status !== "REJECTED") return null;
  const { icon: Icon, title, body } = COPY[status];
  const rejected = status === "REJECTED";

  return (
    <div
      role="status"
      className={cn(
        "mb-6 flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:p-6",
        rejected
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-gold/40 bg-[#f1e6cf] text-[#5f4515] dark:bg-gold/12 dark:text-[#e2cfa6]",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full",
          rejected ? "bg-destructive/15" : "bg-gold/25",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm opacity-85">{body}</p>
      </div>
      {rejected && (
        <Button asChild variant="outline" className="shrink-0 border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10">
          <Link href="/contact">Contact support</Link>
        </Button>
      )}
    </div>
  );
}

/**
 * Wraps a write control (already rendered disabled by the caller) so its
 * reason shows on hover and keyboard focus: disabled buttons get no pointer
 * events, so the wrapper holds the tooltip.
 */
export function ApprovalTooltip({ children, className }: { children: React.ReactNode; className?: string }) {
  const { canWrite, reason } = useLandlordAccess();
  if (canWrite) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn("inline-flex rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

/** Add/edit property pages: a friendly screen instead of the form until approved. */
export function ApprovalGate({ children }: { children: React.ReactNode }) {
  const { status, canWrite } = useLandlordAccess();
  if (canWrite || (status !== "PENDING" && status !== "REJECTED")) return children;
  const { icon: Icon, title } = COPY[status];

  return (
    <div className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <Icon className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-medium tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {status === "PENDING"
          ? "Listing and editing properties opens up once an admin approves your landlord account. It usually doesn't take long."
          : "Your account can't list or edit properties. Contact us if you'd like us to take another look."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard/landlord">Back to dashboard</Link>
        </Button>
        {status === "REJECTED" && (
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/** "Add property": a link when approved, a disabled button with the reason otherwise. */
export function AddPropertyButton() {
  const { canWrite } = useLandlordAccess();
  if (canWrite) {
    return (
      <Button asChild>
        <Link href="/dashboard/landlord/properties/new">
          <Plus data-icon="inline-start" /> Add property
        </Link>
      </Button>
    );
  }
  return (
    <ApprovalTooltip>
      <Button disabled>
        <Plus data-icon="inline-start" /> Add property
      </Button>
    </ApprovalTooltip>
  );
}
