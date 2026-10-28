"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useCreateCategory, useRenameCategory } from "@/hooks/use-categories";
import { isApiError } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import type { Category } from "@/types";

// Backend: name min 1 and unique (409 "Category already exists").
const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(40, "Keep it under 40 characters"),
});
type CategoryValues = z.infer<typeof categorySchema>;

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rename this category; create a new one when omitted. */
  category?: Category | null;
};

/** Create or rename a category. Mount with a `key` so it resets per category. */
export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const create = useCreateCategory();
  const rename = useRenameCategory();
  const isPending = create.isPending || rename.isPending;

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "" },
  });
  const { errors } = form.formState;

  const onSubmit = ({ name }: CategoryValues) => {
    const done = {
      onSuccess: () => onOpenChange(false),
      onError: (error: unknown) => {
        if (applyServerErrors(error, form.setError, ["name"])) return;
        if (isApiError(error) && error.status === 409) {
          form.setError("name", { type: "server", message: "A category with this name already exists" }, { shouldFocus: true });
        }
      },
    };
    if (category) rename.mutate({ id: category.id, input: { name } }, done);
    else create.mutate({ name }, done);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? "Rename category" : "New category"}</DialogTitle>
          <DialogDescription>
            {category ? `Listings in “${category.name}” keep their category.` : "Landlords pick a category for each listing."}
          </DialogDescription>
        </DialogHeader>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField label="Name" htmlFor="category-name" error={errors.name}>
            <Input
              id="category-name"
              placeholder="e.g. Townhouse"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
          </FormField>
        </form>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            {category ? "Save name" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
