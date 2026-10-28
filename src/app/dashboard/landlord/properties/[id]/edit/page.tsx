import type { Metadata } from "next";
import { EditPropertyView } from "@/components/landlord/edit-property-view";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditPropertyPage({
  params,
}: PageProps<"/dashboard/landlord/properties/[id]/edit">) {
  const { id } = await params;
  return <EditPropertyView propertyId={id} />;
}
