import { startOfToday } from "date-fns";
import { z } from "zod";

export const LEASE_OPTIONS = Array.from({ length: 24 }, (_, index) => index + 1);

// Backend: moveInDate is an ISO datetime, leaseMonths a positive integer.
// It doesn't reject past dates, so the form does.
export const rentalRequestSchema = z.object({
  moveInDate: z
    .date({ error: "Choose a move-in date" })
    .refine((date) => date >= startOfToday(), { error: "Move-in date can't be in the past" }),
  leaseMonths: z
    .number({ error: "Choose a lease length" })
    .int()
    .min(1, "Choose a lease length")
    .max(24, "Leases can be up to 24 months"),
});

export type RentalRequestValues = z.infer<typeof rentalRequestSchema>;

/**
 * The picked calendar day as an ISO datetime at 12:00 UTC, so it stays the
 * same date in every US time zone (local midnight could shift a day).
 */
export function toMoveInIso(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString();
}
