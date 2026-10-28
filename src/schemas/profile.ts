import { z } from "zod";
import { PHONE_REGEX } from "@/schemas/auth";
import type { UpdateProfileInput, User } from "@/types";

// Mirrors the backend's updateMyProfileValidationSchema.
export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_REGEX.test(value), {
      error: "Use digits only, e.g. +12125550101",
    }),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export function toProfileValues(user: User): ProfileValues {
  return { name: user.name, email: user.email, phone: user.phone ?? "" };
}

/** Only changed fields (the API rejects an empty body). */
export function profileChanges(user: User, values: ProfileValues): UpdateProfileInput {
  const changes: UpdateProfileInput = {};
  if (values.name !== user.name) changes.name = values.name;
  if (values.email !== user.email) changes.email = values.email;
  if (values.phone && values.phone !== (user.phone ?? "")) changes.phone = values.phone;
  return changes;
}
