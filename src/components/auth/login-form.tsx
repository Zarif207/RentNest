"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { FLOATING_INPUT, FloatingField } from "@/components/auth/floating-field";
import { FormAlert } from "@/components/shared/form-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { afterSignIn, safeRedirect } from "@/lib/auth";
import { applyServerErrors } from "@/lib/forms";
import { loginSchema, type LoginValues } from "@/schemas/auth";

// Public demo accounts, so visitors can sign in quickly. The observer is
// read-only; its values come from env (intentionally public).
const DEMO_ACCOUNTS = [
  { label: "Tenant", email: "tenant1@rentnest.com", password: "Password@123" },
  {
    label: "Observer (read-only)",
    email: process.env.NEXT_PUBLIC_OBSERVER_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_OBSERVER_PASSWORD ?? "",
  },
].filter((account) => account.email && account.password);

const LOGIN_FIELDS = ["email", "password"] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = (values: LoginValues) => {
    login.mutate(values, {
      onSuccess: ({ user }) => router.replace(afterSignIn(redirectTo, user.role)),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, LOGIN_FIELDS)) return;

        // Wrong email or password: same 401 for both, shown under the password.
        if (isApiError(error) && error.status === 401) {
          form.setError("password", { type: "server", message: error.message });
          return;
        }

        form.setError("root.server", { type: "server", message: getErrorMessage(error) });
      },
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert message={errors.root?.server?.message} />

        <FieldGroup className="gap-5">
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

          <FloatingField label="Password" htmlFor="password" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder=" "
              className={FLOATING_INPUT}
              aria-invalid={Boolean(errors.password)}
              {...form.register("password")}
            />
          </FloatingField>
        </FieldGroup>

        <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
          {login.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {login.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="space-y-3 rounded-3xl border border-dashed border-border p-5">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Demo accounts</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(({ label, email, password }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => form.reset({ email, password })}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Fills the form with a demo account. The observer account can view the admin and landlord dashboards
          but cannot change anything.
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New to RentNest?{" "}
        <Link
          href={redirectTo ? `/auth/register?redirect=${encodeURIComponent(redirectTo)}` : "/auth/register"}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
