import { z } from "zod";

// Mirrors the backend's auth.validation.ts (and the profile phone regex).

export const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(["TENANT", "LANDLORD"], {
      error: "Choose how you'll use RentNest",
    }),
    name: z.string().trim().min(1, "Name is required"),
    email: z.email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || PHONE_REGEX.test(value), {
        error: "Use digits only, e.g. +12125550101",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don't match",
  });

export type RegisterValues = z.infer<typeof registerSchema>;
