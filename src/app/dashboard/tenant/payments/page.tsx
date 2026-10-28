import type { Metadata } from "next";
import { PaymentsView } from "@/components/tenant/payments-view";

export const metadata: Metadata = { title: "Payments" };

export default function TenantPaymentsPage() {
  return <PaymentsView />;
}
