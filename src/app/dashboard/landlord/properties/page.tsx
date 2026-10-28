import type { Metadata } from "next";
import { PropertiesView } from "@/components/landlord/properties-view";

export const metadata: Metadata = { title: "My properties" };

export default function LandlordPropertiesPage() {
  return <PropertiesView />;
}
