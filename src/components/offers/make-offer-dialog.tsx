"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOffer } from "@/hooks/use-offers";
import { formatCurrency } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { depositFor, FINANCING_LABELS, percentOfAsking } from "@/lib/offers";
import { offerSchema, type OfferValues } from "@/schemas/offer";
import { OFFER_FINANCING } from "@/types";

const MESSAGE_MAX = 500;

type MakeOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: { id: string; title: string; salePrice: string | null };
  onSent: () => void;
};

/**
 * Offer form: amount (prefilled with the asking price, with its % of asking),
 * how the buyer will pay and an optional note, plus the deposit that would
 * apply if the owner accepts this price.
 */
export function MakeOfferDialog({ open, onOpenChange, property, onSent }: MakeOfferDialogProps) {
  const createOffer = useCreateOffer();
  const asking = Number(property.salePrice) || null;

  const form = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: { offerAmount: asking ?? undefined, financing: "MORTGAGE", message: "" },
  });
  const { errors } = form.formState;
  const [offerAmount, message] = useWatch({ control: form.control, name: ["offerAmount", "message"] });
  const amount = Number(offerAmount) || 0;

  const onSubmit = (values: OfferValues) => {
    createOffer.mutate(
      {
        propertyId: property.id,
        offerAmount: values.offerAmount,
        financing: values.financing,
        message: values.message || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSent();
        },
        onError: (error) => applyServerErrors(error, form.setError, ["offerAmount", "financing", "message"]),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !createOffer.isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Make an offer</DialogTitle>
          <DialogDescription>{property.title}</DialogDescription>
        </DialogHeader>

        <form id="make-offer-form" onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField
            label="Your offer"
            htmlFor="offerAmount"
            error={errors.offerAmount}
            description={
              asking
                ? `Asking ${formatCurrency(asking)}${amount ? ` · ${percentOfAsking(amount, asking)}` : ""}`
                : undefined
            }
          >
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="offerAmount"
                type="number"
                inputMode="numeric"
                min={1}
                step="any"
                className="pl-6"
                aria-invalid={Boolean(errors.offerAmount)}
                {...form.register("offerAmount", { valueAsNumber: true })}
              />
            </div>
          </FormField>

          <FormField label="How will you pay?" htmlFor="financing" error={errors.financing}>
            <Controller
              control={form.control}
              name="financing"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="financing" className="w-full" aria-invalid={Boolean(errors.financing)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFER_FINANCING.map((option) => (
                      <SelectItem key={option} value={option}>
                        {FINANCING_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Message to the owner (optional)"
            htmlFor="message"
            error={errors.message}
            description={`${message?.length ?? 0} / ${MESSAGE_MAX}`}
          >
            <Textarea
              id="message"
              rows={3}
              maxLength={MESSAGE_MAX}
              placeholder="Anything the owner should know, like your timing."
              aria-invalid={Boolean(errors.message)}
              {...form.register("message")}
            />
          </FormField>

          <div className="space-y-1.5 rounded-2xl bg-surface p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Deposit if accepted at this price</span>
              <span className="font-semibold">{amount ? formatCurrency(depositFor(amount)) : "—"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nothing is charged now. If the owner accepts, you pay a deposit of 1% of the agreed price (at least
              $500) to put the home under contract. You can withdraw until you pay it.
            </p>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createOffer.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="make-offer-form" variant="gold" disabled={createOffer.isPending}>
            {createOffer.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {createOffer.isPending ? "Sending…" : "Send offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
