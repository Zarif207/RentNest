import { z } from "zod";
import { OFFER_FINANCING } from "@/types";

export const offerSchema = z.object({
  offerAmount: z
    .number({ error: "Enter your offer" })
    .positive("Your offer must be greater than 0")
    .max(1_000_000_000, "That offer is too large"),
  financing: z.enum(OFFER_FINANCING, { error: "Choose how you'll pay" }),
  message: z.string().trim().max(500, "Keep the message under 500 characters").optional(),
});

export type OfferValues = z.infer<typeof offerSchema>;

export const counterSchema = z.object({
  counterAmount: z
    .number({ error: "Enter your counter price" })
    .positive("The counter price must be greater than 0")
    .max(1_000_000_000, "That price is too large"),
});

export type CounterValues = z.infer<typeof counterSchema>;
