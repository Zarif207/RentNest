import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Classes the input inside a FloatingField needs (taller, room for the label). Pair with placeholder=" ". */
export const FLOATING_INPUT = "h-14 pt-5 pb-1";

type FloatingFieldProps = {
  label: React.ReactNode;
  htmlFor: string;
  error?: { message?: string };
  description?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * A field whose label sits inside the input and floats up on focus or once
 * there's a value. Works with wrapped inputs (PasswordInput) because it reads
 * the wrapper's state (focus-within, :placeholder-shown) rather than a sibling.
 */
export function FloatingField({ label, htmlFor, error, description, children }: FloatingFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <div className="group/float relative">
        {children}
        <label
          htmlFor={htmlFor}
          className={cn(
            "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 ease-out",
            "group-focus-within/float:top-4.5 group-focus-within/float:text-xs",
            "group-has-[input:not(:placeholder-shown)]/float:top-4.5 group-has-[input:not(:placeholder-shown)]/float:text-xs",
            error && "text-destructive",
          )}
        >
          {label}
        </label>
      </div>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
