import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminOverviewPage() {
  return <DashboardWelcome role="ADMIN" />;
}
