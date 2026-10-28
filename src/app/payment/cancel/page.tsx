import type { Metadata } from "next";
import { PaymentCancelView } from "@/components/payment/payment-cancel-view";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  return <PaymentCancelView />;
}
