"use client";

import { useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { StarInput } from "@/components/reviews/star-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/hooks/use-reviews";
import { applyServerErrors } from "@/lib/forms";
import { reviewSchema, type ReviewValues } from "@/schemas/review";

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: { id: string; title: string };
};

export function ReviewDialog({ open, onOpenChange, property }: ReviewDialogProps) {
  const id = useId();
  const createReview = useCreateReview();
  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { comment: "" },
  });
  const { errors } = form.formState;
  const comment = useWatch({ control: form.control, name: "comment" }) ?? "";

  const onSubmit = (values: ReviewValues) => {
    createReview.mutate(
      { propertyId: property.id, ...values },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => applyServerErrors(error, form.setError, ["rating", "comment"]),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !createReview.isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Review your stay</DialogTitle>
          <DialogDescription>{property.title}</DialogDescription>
        </DialogHeader>

        <form id={`${id}-form`} onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Field data-invalid={Boolean(errors.rating)}>
            <FieldLabel id={`${id}-rating`}>Your rating</FieldLabel>
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <StarInput
                  name={`${id}-stars`}
                  value={field.value}
                  onChange={field.onChange}
                  labelledBy={`${id}-rating`}
                  invalid={Boolean(errors.rating)}
                />
              )}
            />
            <FieldError errors={[errors.rating]} />
          </Field>

          <Field data-invalid={Boolean(errors.comment)}>
            <FieldLabel htmlFor={`${id}-comment`}>Your review</FieldLabel>
            <Textarea
              id={`${id}-comment`}
              rows={5}
              maxLength={1000}
              placeholder="What was it like living here? Think location, upkeep, the landlord…"
              aria-invalid={Boolean(errors.comment)}
              {...form.register("comment")}
            />
            {errors.comment ? (
              <FieldError errors={[errors.comment]} />
            ) : (
              <FieldDescription>{comment.trim().length}/1000 · at least 10 characters</FieldDescription>
            )}
          </Field>
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createReview.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={`${id}-form`} disabled={createReview.isPending}>
            {createReview.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {createReview.isPending ? "Posting…" : "Post review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
