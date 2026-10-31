import type { Metadata } from "next";
import { Suspense } from "react";
import { LandlordOffersView } from "@/components/landlord/offers-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Offers" };

export default function LandlordOffersPage() {
  // The view reads ?status=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Loading />}>
      <LandlordOffersView />
    </Suspense>
  );
}
