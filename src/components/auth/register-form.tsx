"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { FLOATING_INPUT, FloatingField } from "@/components/auth/floating-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { RolePicker } from "@/components/auth/role-picker";
import { FormAlert } from "@/components/shared/form-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { roleHome, safeRedirect } from "@/lib/auth";
import { applyServerErrors } from "@/lib/forms";
import { registerSchema, type RegisterValues } from "@/schemas/auth";

const REGISTER_FIELDS = ["role", "name", "email", "phone", "password"] as const;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const registerUser = useRegister();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // "List your property" links here with ?role=LANDLORD.
      role: searchParams.get("role") === "LANDLORD" ? "LANDLORD" : "TENANT",
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { errors } = form.formState;
  const [role, password] = useWatch({ control: form.control, name: ["role", "password"] });

  const onSubmit = ({ role, name, email, phone, password }: RegisterValues) => {
    registerUser.mutate(
      { role, name, email, password, phone: phone || undefined },
      {
        onSuccess: ({ user }) => router.replace(redirectTo ?? roleHome(user.role)),
        onError: (error) => {
          if (applyServerErrors(error, form.setError, REGISTER_FIELDS)) return;

          // "User already exists" comes back as a 409 without a field path.
          if (isApiError(error) && error.status === 409) {
            form.setError(
              "email",
              { type: "server", message: "An account with this email already exists" },
              { shouldFocus: true },
            );
            return;
          }

          form.setError("root.server", { type: "server", message: getErrorMessage(error) });
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert message={errors.root?.server?.message} />

        <RolePicker registration={form.register("role")} value={role} error={errors.role} />

        <FieldGroup className="gap-5">
          <FloatingField label="Full name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              autoComplete="name"
              placeholder=" "
              className={FLOATING_INPUT}
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
          </FloatingField>

          <FloatingField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder=" "
              className={FLOATING_INPUT}
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
          </FloatingField>

          <FloatingField
            label={
              <>
                Phone <span className="text-muted-foreground/70">(optional)</span>
              </>
            }
            htmlFor="phone"
            error={errors.phone}
            description="Digits only, with an optional + country code."
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder=" "
              className={FLOATING_INPUT}
              aria-invalid={Boolean(errors.phone)}
              {...form.register("phone")}
            />
          </FloatingField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FloatingField label="Password" htmlFor="password" error={errors.password}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder=" "
              className={FLOATING_INPUT}
                aria-invalid={Boolean(errors.password)}
                {...form.register("password")}
              />
            </FloatingField>

            <FloatingField
              label="Confirm password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder=" "
              className={FLOATING_INPUT}
                aria-invalid={Boolean(errors.confirmPassword)}
                {...form.register("confirmPassword")}
              />
            </FloatingField>
          </div>
          <PasswordStrength password={password} />
        </FieldGroup>

        <Button type="submit" size="lg" className="w-full" disabled={registerUser.isPending}>
          {registerUser.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {registerUser.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
