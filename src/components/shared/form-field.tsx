import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

type FormFieldProps = {
  label: React.ReactNode;
  htmlFor: string;
  error?: { message?: string };
  description?: React.ReactNode;
  children: React.ReactNode;
};

/** Label, control and error message for one React Hook Form field. */
export function FormField({
  label,
  htmlFor,
  error,
  description,
  children,
}: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
