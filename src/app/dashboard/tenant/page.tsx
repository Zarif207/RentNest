import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Tenant dashboard" };

export default function TenantOverviewPage() {
  return <DashboardWelcome role="TENANT" />;
}
