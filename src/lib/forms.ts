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
    const field = fields.find((name) => name === detail.path);
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
