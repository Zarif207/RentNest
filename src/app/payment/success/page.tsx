import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessView } from "@/components/payment/payment-success-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Payment successful" };

export default function PaymentSuccessPage() {
  // The view reads ?session_id=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
      <PaymentSuccessView />
    </Suspense>
  );
}
