import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { NotFoundState } from "@/components/shared/not-found-state";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <NotFoundState
      title="This page doesn't exist"
      description="The dashboard page you tried to open isn't here. Use the menu, or go back to your overview."
      className="rounded-3xl border bg-card py-20"
      actions={
        <Button asChild>
          <Link href="/dashboard">
            <LayoutDashboard data-icon="inline-start" /> Back to dashboard
          </Link>
        </Button>
      }
    />
  );
}
