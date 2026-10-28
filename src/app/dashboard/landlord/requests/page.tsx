import type { Metadata } from "next";
import { Suspense } from "react";
import { LandlordRequestsView } from "@/components/landlord/requests-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Rental requests" };

export default function LandlordRequestsPage() {
  // The view reads ?status=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Loading />}>
      <LandlordRequestsView />
    </Suspense>
  );
}
