import type { Metadata } from "next";
import { ListingPreview } from "@/components/properties/listing-preview";

export const metadata: Metadata = { title: "Preview listing" };

// Admins check a listing here before approving it (the public page 404s until then).
export default async function AdminListingPreviewPage({
  params,
}: PageProps<"/dashboard/admin/properties/[id]">) {
  const { id } = await params;
  return <ListingPreview propertyId={id} viewer="ADMIN" />;
}
