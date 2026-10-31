import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelView } from "@/components/payment/payment-cancel-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  // The view reads ?type= and ?offerId=, which needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
      <PaymentCancelView />
    </Suspense>
  );
}
