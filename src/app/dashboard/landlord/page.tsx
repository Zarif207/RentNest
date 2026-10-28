import type { Metadata } from "next";
import { LandlordOverview } from "@/components/landlord/landlord-overview";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default function LandlordOverviewPage() {
  return <LandlordOverview />;
}
