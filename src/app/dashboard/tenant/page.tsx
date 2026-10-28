import type { Metadata } from "next";
import { TenantOverview } from "@/components/tenant/tenant-overview";

export const metadata: Metadata = { title: "Tenant dashboard" };

export default function TenantOverviewPage() {
  return <TenantOverview />;
}
