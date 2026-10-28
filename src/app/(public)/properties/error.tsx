"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function PropertiesError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      icon={SearchX}
      title="We couldn't load properties"
      description="The listings service didn't respond. Try again, or start a fresh search."
      retry={retry}
      action={
        <Button asChild variant="ghost">
          <Link href="/properties">Reset filters</Link>
        </Button>
      }
    />
  );
}
