"use client";

import Link from "next/link";
import { House } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function PropertyError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      icon={House}
      title="We couldn't load this home"
      description="Something went wrong while fetching the listing. Please try again."
      retry={retry}
      action={
        <Button asChild variant="ghost">
          <Link href="/properties">Browse properties</Link>
        </Button>
      }
    />
  );
}
