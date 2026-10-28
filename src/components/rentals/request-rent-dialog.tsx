"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, startOfToday } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRental } from "@/hooks/use-rentals";
import { formatCurrency } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";
import {
  LEASE_OPTIONS,
  rentalRequestSchema,
  toMoveInIso,
  type RentalRequestValues,
} from "@/schemas/rental";

type RequestRentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: { id: string; title: string; rentAmount: string };
  onSent: () => void;
};

const months = (count: number) => `${count} ${count === 1 ? "month" : "months"}`;

export function RequestRentDialog({ open, onOpenChange, property, onSent }: RequestRentDialogProps) {
  const createRental = useCreateRental();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<RentalRequestValues>({
    resolver: zodResolver(rentalRequestSchema),
    defaultValues: { leaseMonths: 12 },
  });
  const { errors } = form.formState;
  const [moveInDate, leaseMonths] = useWatch({
    control: form.control,
    name: ["moveInDate", "leaseMonths"],
  });

  const monthlyRent = Number(property.rentAmount);
  const total = leaseMonths ? monthlyRent * leaseMonths : null;

  const onSubmit = (values: RentalRequestValues) => {
    createRental.mutate(
      {
        propertyId: property.id,
        moveInDate: toMoveInIso(values.moveInDate),
        leaseMonths: values.leaseMonths,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSent();
        },
        onError: (error) => applyServerErrors(error, form.setError, ["moveInDate", "leaseMonths"]),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !createRental.isPending && onOpenChange(next)}>
      <DialogContent className="gap-6 rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Request to rent</DialogTitle>
          <DialogDescription>{property.title}</DialogDescription>
        </DialogHeader>

        <form id="request-rent-form" onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField label="Move-in date" htmlFor="moveInDate" error={errors.moveInDate}>
            <Controller
              control={form.control}
              name="moveInDate"
              render={({ field }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="moveInDate"
                      type="button"
                      variant="outline"
                      aria-invalid={Boolean(errors.moveInDate)}
                      className={cn(
                        "w-full justify-start rounded-xl font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays data-icon="inline-start" />
                      {field.value ? format(field.value, "EEEE, MMMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setCalendarOpen(false);
                      }}
                      disabled={{ before: startOfToday() }}
                      startMonth={startOfToday()}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </FormField>

          <FormField label="Lease length" htmlFor="leaseMonths" error={errors.leaseMonths}>
            <Controller
              control={form.control}
              name="leaseMonths"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="leaseMonths" className="w-full" aria-invalid={Boolean(errors.leaseMonths)}>
                    <SelectValue placeholder="Choose a lease length" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEASE_OPTIONS.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {months(count)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <dl className="space-y-2 rounded-2xl bg-surface p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Monthly rent</dt>
              <dd>{formatCurrency(monthlyRent)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Lease</dt>
              <dd>
                {leaseMonths ? `× ${months(leaseMonths)}` : "—"}
                {moveInDate && leaseMonths && (
                  <span className="text-muted-foreground">
                    {" "}
                    · ends {format(addMonths(moveInDate, leaseMonths), "MMM d, yyyy")}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="italic">{formatCurrency(total)}</dd>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              You&apos;ll only pay after the landlord approves your request.
            </p>
          </dl>
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createRental.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="request-rent-form" disabled={createRental.isPending}>
            {createRental.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {createRental.isPending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
