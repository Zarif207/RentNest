"use client";

import { CloudOff } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ErrorState } from "@/components/shared/error-state";

export default function PublicError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <PageShell>
      <ErrorState
        className="py-0"
        icon={CloudOff}
        title="Something went wrong"
        description="We couldn't load this page. Check your connection and try again."
        retry={retry}
      />
    </PageShell>
  );
}
