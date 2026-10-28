import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminRentalsView } from "@/components/admin/rentals-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Rentals" };

export default function AdminRentalsPage() {
  // The view reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<Loading />}>
      <AdminRentalsView />
    </Suspense>
  );
}
