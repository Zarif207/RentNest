"use client";

import { TriangleAlert } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";

// Catches errors in routes without their own boundary (auth, payment).
export default function RootError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      icon={TriangleAlert}
      title="Something went wrong"
      description="This page hit an unexpected problem. Try again, or head back to the home page."
      retry={retry}
    />
  );
}
