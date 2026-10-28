import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/api/client";

/**
 * Puts backend `errorDetails` onto the matching form fields.
 * Returns true if at least one field error was set.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  if (!isApiError(error)) return false;

  let applied = false;

  for (const detail of error.errorDetails) {
    // "amenities.0" (one array item) belongs to the "amenities" field.
    const field = fields.find(
      (name) => detail.path === name || detail.path.startsWith(`${name}.`),
    );
    if (!field) continue;

    setError(
      field,
      { type: "server", message: detail.message },
      { shouldFocus: !applied },
    );
    applied = true;
  }

  return applied;
}
