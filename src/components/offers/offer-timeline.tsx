import { Check, Circle, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types";

type Step = { label: string; detail?: string; state: "done" | "current" | "todo" | "stopped" };

/** Offer → response → deposit → sale, from the offer's real status and dates. */
function steps(offer: Offer): Step[] {
  const { status } = offer;
  const agreed = offer.agreedAmount ? formatCurrency(offer.agreedAmount) : null;
  const response: Step =
    status === "PENDING"
      ? { label: "Owner's answer", detail: "Waiting for the owner", state: "current" }
      : status === "COUNTERED"
        ? { label: "Countered", detail: `${formatCurrency(offer.counterAmount)} · your move`, state: "current" }
        : status === "REJECTED"
          ? { label: "Declined", detail: formatDate(offer.updatedAt), state: "stopped" }
          : status === "WITHDRAWN"
            ? { label: "Withdrawn", detail: formatDate(offer.updatedAt), state: "stopped" }
            : status === "EXPIRED"
              ? { label: "Expired", detail: "No action for 7 days", state: "stopped" }
              : { label: "Accepted", detail: agreed ?? undefined, state: "done" };
  const ended = response.state === "stopped";
  const depositPaid = status === "DEPOSIT_PAID" || status === "COMPLETED";

  return [
    { label: "Offer sent", detail: `${formatCurrency(offer.offerAmount)} · ${formatDate(offer.createdAt)}`, state: "done" },
    response,
    {
      label: "Deposit",
      detail: depositPaid
        ? `Paid ${formatDate(offer.payment?.paymentDate ?? offer.updatedAt)}`
        : offer.depositAmount
          ? formatCurrency(offer.depositAmount)
          : undefined,
      state: ended ? "todo" : depositPaid ? "done" : status === "ACCEPTED" ? "current" : "todo",
    },
    {
      label: "Sale completed",
      detail: status === "COMPLETED" ? formatDate(offer.updatedAt) : status === "DEPOSIT_PAID" ? "Waiting for the owner" : undefined,
      state: status === "COMPLETED" ? "done" : status === "DEPOSIT_PAID" ? "current" : "todo",
    },
  ];
}

const DOT = {
  done: "bg-gold text-gold-foreground",
  current: "border-2 border-gold bg-background text-bronze",
  todo: "border border-border bg-background text-muted-foreground",
  stopped: "bg-destructive/10 text-destructive",
};

export function OfferTimeline({ offer, className }: { offer: Offer; className?: string }) {
  return (
    <ol className={cn("grid gap-3 sm:grid-cols-4", className)} aria-label="Offer progress">
      {steps(offer).map((step, index) => {
        const Icon = step.state === "done" ? Check : step.state === "stopped" ? X : Circle;
        return (
          <li key={index} className="flex items-start gap-2.5 sm:flex-col sm:gap-2">
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", DOT[step.state])}>
              <Icon className={step.state === "done" || step.state === "stopped" ? "size-3.5" : "size-2 fill-current"} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-medium", step.state === "todo" && "text-muted-foreground")}>
                {step.label}
                <span className="sr-only">
                  {step.state === "done" ? " (done)" : step.state === "current" ? " (in progress)" : step.state === "stopped" ? " (ended)" : " (not yet)"}
                </span>
              </span>
              {step.detail && <span className="block text-xs text-muted-foreground">{step.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
