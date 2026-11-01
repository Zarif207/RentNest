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
import { Textarea } from "@/components/ui/textarea";
import { rejectListingSchema, type RejectListingValues } from "@/schemas/property";
import type { PropertyWithRelations } from "@/types";

const MAX = 500;

/** Reject a listing with a reason; the landlord sees it and can fix and resubmit. */
export function RejectListingDialog({
  property,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  property: PropertyWithRelations | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (property: PropertyWithRelations, note: string) => void;
  isPending: boolean;
}) {
  const form = useForm<RejectListingValues>({
    resolver: zodResolver(rejectListingSchema),
    // Fresh for every listing.
    values: { note: "" },
  });
  const { errors } = form.formState;
  const length = (useWatch({ control: form.control, name: "note" }) ?? "").trim().length;

  return (
    <Dialog open={property !== null} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Reject this listing?</DialogTitle>
          <DialogDescription>
            {property?.owner.name} will see your reason on {property?.title} and can edit the listing to send it for
            review again.
          </DialogDescription>
        </DialogHeader>

        <form
          id="reject-listing-form"
          noValidate
          onSubmit={form.handleSubmit((values) => property && onSubmit(property, values.note))}
        >
          <FormField
            label="Reason"
            htmlFor="reject-note"
            error={errors.note}
            description={`${length}/${MAX} characters`}
          >
            <Textarea
              id="reject-note"
              rows={4}
              autoFocus
              placeholder="e.g. Please add photos of the kitchen and bathroom, and check the asking price."
              aria-invalid={Boolean(errors.note)}
              {...form.register("note")}
            />
          </FormField>
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="reject-listing-form" variant="destructive" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            Reject listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
