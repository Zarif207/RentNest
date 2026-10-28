import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPropertiesView } from "@/components/admin/properties-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Properties" };

export default function AdminPropertiesPage() {
  // The view reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<Loading />}>
      <AdminPropertiesView />
    </Suspense>
  );
}
