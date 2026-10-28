"use client";

import Link from "next/link";
import { LayoutDashboard, TriangleAlert } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function DashboardError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      icon={TriangleAlert}
      title="This page didn't load"
      description="Something went wrong on our side. Try again, or head back to your dashboard."
      retry={retry}
      className="rounded-3xl border bg-card py-20"
      action={
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <LayoutDashboard data-icon="inline-start" /> Dashboard
          </Link>
        </Button>
      }
    />
  );
}
