import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestsView } from "@/components/tenant/requests-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "My requests" };

export default function TenantRequestsPage() {
  // RequestsView reads ?status=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Loading />}>
      <RequestsView />
    </Suspense>
  );
}
