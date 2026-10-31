"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { depositFor } from "@/lib/offers";
import { counterSchema, type CounterValues } from "@/schemas/offer";
import type { Offer } from "@/types";

/** The owner's counter price for a pending offer (starts between the offer and the asking price). */
export function CounterOfferDialog({
  offer,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  offer: Offer | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (offer: Offer, counterAmount: number) => void;
  isPending: boolean;
}) {
  const asking = Number(offer?.property.salePrice) || null;
  const offered = Number(offer?.offerAmount) || 0;
  const form = useForm<CounterValues>({
    resolver: zodResolver(counterSchema),
    values: { counterAmount: asking ? Math.round((asking + offered) / 2 / 1000) * 1000 : offered },
  });
  const { errors } = form.formState;
  const counter = Number(useWatch({ control: form.control, name: "counterAmount" })) || 0;

  return (
    <Dialog open={offer !== null} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Counter this offer</DialogTitle>
          <DialogDescription>
            {offer?.buyer.name} offered {formatCurrency(offer?.offerAmount)} for {offer?.property.title}.
          </DialogDescription>
        </DialogHeader>

        <form
          id="counter-offer-form"
          noValidate
          onSubmit={form.handleSubmit((values) => offer && onSubmit(offer, values.counterAmount))}
          className="space-y-5"
        >
          <FormField
            label="Your counter price"
            htmlFor="counterAmount"
            error={errors.counterAmount}
            description={asking ? `Asking ${formatCurrency(asking)}` : undefined}
          >
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="counterAmount"
                type="number"
                inputMode="numeric"
                min={1}
                step="any"
                className="pl-6"
                aria-invalid={Boolean(errors.counterAmount)}
                {...form.register("counterAmount", { valueAsNumber: true })}
              />
            </div>
          </FormField>
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
            If the buyer accepts, they pay a deposit of{" "}
            <span className="font-medium text-foreground">{counter ? formatCurrency(depositFor(counter)) : "—"}</span>{" "}
            to put the home under contract.
          </p>
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="counter-offer-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            Send counteroffer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
