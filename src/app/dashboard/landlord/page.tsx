import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default function LandlordOverviewPage() {
  return <DashboardWelcome role="LANDLORD" />;
}
