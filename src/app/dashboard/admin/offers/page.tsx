import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOffersView } from "@/components/admin/offers-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Offers" };

export default function AdminOffersPage() {
  // The view reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<Loading />}>
      <AdminOffersView />
    </Suspense>
  );
}
