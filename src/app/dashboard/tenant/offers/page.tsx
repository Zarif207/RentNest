import type { Metadata } from "next";
import { Suspense } from "react";
import { OffersView } from "@/components/tenant/offers-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "My offers" };

export default function TenantOffersPage() {
  // OffersView reads ?status=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Loading />}>
      <OffersView />
    </Suspense>
  );
}
