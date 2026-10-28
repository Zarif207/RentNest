import { z } from "zod";

// Backend: rating int 1–5, comment 1–1000 chars. We ask for at least 10
// characters so reviews say something useful.
export const reviewSchema = z.object({
  rating: z
    .number({ error: "Choose a rating" })
    .int()
    .min(1, "Choose a rating")
    .max(5, "Choose a rating"),
  comment: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters")
    .max(1000, "Keep it under 1,000 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
