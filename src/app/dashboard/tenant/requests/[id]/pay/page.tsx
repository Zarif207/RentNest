import type { Metadata } from "next";
import { PayView } from "@/components/tenant/pay-view";

export const metadata: Metadata = { title: "Pay for rental" };

export default async function PayPage({ params }: PageProps<"/dashboard/tenant/requests/[id]/pay">) {
  const { id } = await params;
  return <PayView rentalId={id} />;
}
