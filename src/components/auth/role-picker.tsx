"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Building2, Check, Search } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
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
  /** The currently selected role, for the animated highlight. */
  value: RegisterValues["role"] | undefined;
  error?: { message?: string };
};

/**
 * Two selectable cards backed by native radios (arrow keys work). The
 * selection outline slides between cards and a check pops in.
 */
export function RolePicker({ registration, value, error }: RolePickerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        I am joining as
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ value: role, title, description, icon: Icon }) => {
          const selected = value === role;
          return (
            <label
              key={role}
              className={cn(
                "group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-border p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                selected ? "bg-card" : "hover:bg-card/60",
              )}
            >
              <input type="radio" value={role} className="sr-only" {...registration} />
              {selected && (
                <motion.span
                  layoutId="role-picker-outline"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.5 }}
                  aria-hidden
                  className="absolute -inset-px rounded-2xl border-2 border-foreground"
                />
              )}
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full transition-colors duration-300",
                  selected ? "bg-foreground text-background" : "bg-secondary text-foreground",
                )}
              >
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="block text-sm text-muted-foreground">{description}</span>
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    key="check"
                    initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduceMotion ? undefined : { scale: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
                    aria-hidden
                    className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-gold text-gold-foreground"
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </label>
          );
        })}
      </div>
      <FieldError errors={[error]} />
    </fieldset>
  );
}
