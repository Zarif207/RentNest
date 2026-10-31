"use client";

import Link from "next/link";
import { ArrowRight, Hourglass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLandlordAccess } from "@/hooks/use-landlord-access";
import { cn } from "@/lib/utils";

const NEW_LISTING_PATH = "/dashboard/landlord/properties/new";

/**
 * The /sell call to action for whoever is looking: sign up as an owner, list
 * a home (approved owners), or what's in the way (pending owners, tenants,
 * admins). `tone="dark"` sits on a photo.
 */
export function SellCta({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { user, isLoading } = useAuth();
  const { status } = useLandlordAccess();
  const dark = tone === "dark";
  const note = cn("text-sm", dark ? "text-white/75" : "text-muted-foreground");
  const outline = dark ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white" : undefined;

  if (isLoading) {
    return (
      <Button size="lg" variant="gold" disabled className={className}>
        <Loader2 className="animate-spin" aria-hidden /> Loading…
      </Button>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
        <Button asChild size="lg" variant="gold">
          <Link href="/auth/register?role=LANDLORD">
            Register as an owner <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className={outline}>
          <Link href={`/auth/login?redirect=${encodeURIComponent(NEW_LISTING_PATH)}`}>I already have an account</Link>
        </Button>
      </div>
    );
  }

  if (user.role === "LANDLORD" && status === "APPROVED") {
    return (
      <Button asChild size="lg" variant="gold" className={className}>
        <Link href={NEW_LISTING_PATH}>
          List a property <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    );
  }

  if (user.role === "LANDLORD") {
    return (
      <div className={cn("space-y-3", className)}>
        <p className={cn("flex items-center gap-2", note)}>
          <Hourglass className="size-4 shrink-0" aria-hidden />
          {status === "REJECTED"
            ? "Your owner application was rejected. Contact us if you think that's a mistake."
            : "Your owner account is waiting for admin approval. You can list homes as soon as it's approved."}
        </p>
        <Button asChild size="lg" variant="outline" className={outline}>
          <Link href="/dashboard/landlord">Go to your dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <p className={cn("max-w-md", note, className)}>
      {user.role === "ADMIN"
        ? "Admins manage listings from the dashboard. Owner accounts list homes for sale."
        : "You're signed in with a tenant account. Homes are listed from an owner account: sign out and register as an owner to sell."}
    </p>
  );
}
