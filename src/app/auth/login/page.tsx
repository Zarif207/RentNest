import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { LoginForm } from "@/components/auth/login-form";
import { SerifAccent } from "@/components/shared/serif-accent";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Log in</p>
        <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter">
          Welcome <SerifAccent>back</SerifAccent>
        </h1>
        <p className="text-muted-foreground">
          Log in to manage your rental requests, listings and payments.
        </p>
      </div>
      {/* LoginForm reads ?redirect=, which needs a Suspense boundary. */}
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
