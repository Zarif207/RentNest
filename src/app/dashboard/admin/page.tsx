import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminOverviewPage() {
  return <AdminOverview />;
}
