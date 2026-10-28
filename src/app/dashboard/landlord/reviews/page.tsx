import type { Metadata } from "next";
import { LandlordReviewsView } from "@/components/landlord/reviews-view";

export const metadata: Metadata = { title: "Reviews" };

export default function LandlordReviewsPage() {
  return <LandlordReviewsView />;
}
