import type { Metadata } from "next";
import { SavedHomesView } from "@/components/tenant/saved-homes-view";

export const metadata: Metadata = { title: "Saved homes" };

export default function TenantFavoritesPage() {
  return <SavedHomesView />;
}
