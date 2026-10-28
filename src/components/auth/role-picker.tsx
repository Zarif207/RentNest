import { Building2, Search } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "@/components/ui/field";
import type { RegisterValues } from "@/schemas/auth";

const ROLES = [
  {
    value: "TENANT",
    title: "Tenant",
    description: "I'm looking for a home",
    icon: Search,
  },
  {
    value: "LANDLORD",
    title: "Landlord",
    description: "I want to list properties",
    icon: Building2,
  },
] as const satisfies readonly {
  value: RegisterValues["role"];
  title: string;
  description: string;
  icon: typeof Search;
}[];

type RolePickerProps = {
  registration: UseFormRegisterReturn<"role">;
  error?: { message?: string };
};

/** Two selectable cards backed by native radios (arrow keys work). */
export function RolePicker({ registration, error }: RolePickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-medium">I am joining as</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ value, title, description, icon: Icon }) => (
          <label
            key={value}
            className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors hover:bg-surface has-checked:border-foreground has-checked:bg-surface has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input type="radio" value={value} className="sr-only" {...registration} />
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-foreground transition-colors group-has-checked:bg-foreground group-has-checked:text-background">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="block text-sm text-muted-foreground">{description}</span>
            </span>
            <span
              aria-hidden
              className="absolute top-4 right-4 size-4 rounded-full border-2 border-border transition-colors group-has-checked:border-[5px] group-has-checked:border-foreground"
            />
          </label>
        ))}
      </div>
      <FieldError errors={[error]} />
    </fieldset>
  );
}
