import type { Metadata } from "next";
import { ListingPreview } from "@/components/properties/listing-preview";

export const metadata: Metadata = { title: "Preview listing" };

// The owner's view of a listing that isn't public yet (pending or rejected).
export default async function LandlordListingPreviewPage({
  params,
}: PageProps<"/dashboard/landlord/properties/[id]">) {
  const { id } = await params;
  return <ListingPreview propertyId={id} viewer="LANDLORD" />;
}
