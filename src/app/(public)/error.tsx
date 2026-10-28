"use client";

import { CloudOff } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";

export default function PublicError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      icon={CloudOff}
      title="Something went wrong"
      description="We couldn't load this page. Check your connection and try again."
      retry={retry}
    />
  );
}
