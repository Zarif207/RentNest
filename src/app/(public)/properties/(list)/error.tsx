"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function PropertiesError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <PageShell>
      <ErrorState
        className="py-0"
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
    </PageShell>
  );
}
