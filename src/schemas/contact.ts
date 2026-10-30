import { z } from "zod";

export const CONTACT_SUBJECTS = [
  "General",
  "Tenant support",
  "Landlord support",
  "Payments",
  "Partnership",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Keep it under 80 characters"),
  email: z.email("Enter a valid email address"),
  subject: z.enum(CONTACT_SUBJECTS, { error: "Choose a subject" }),
  message: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters")
    .max(2000, "Keep it under 2,000 characters"),
});

export type ContactValues = z.infer<typeof contactSchema>;
