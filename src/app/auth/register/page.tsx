import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { RegisterForm } from "@/components/auth/register-form";
import { SerifAccent } from "@/components/shared/serif-accent";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Create an account</p>
        <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter">
          Find your next <SerifAccent>home</SerifAccent>
        </h1>
        <p className="text-muted-foreground">
          Create a free account to request rentals or list your properties.
        </p>
      </div>
      {/* RegisterForm reads ?redirect=, which needs a Suspense boundary. */}
      <Suspense fallback={<AuthFormSkeleton fields={5} />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
