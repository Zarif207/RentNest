import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What RentNest stores about you and how it's used.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="October 30, 2026"
      sections={[
        {
          heading: "What we store",
          body: "Your name, email address, optional phone number and role (tenant or landlord), plus the listings, rental requests, payments and reviews you create on RentNest.",
        },
        {
          heading: "Card details",
          body: "Payments run on Stripe's hosted checkout. Your card number goes straight to Stripe; RentNest only stores the payment's status, amount and Stripe reference.",
        },
        {
          heading: "How it's used",
          body: "To run your account: showing your requests to the landlord, showing a landlord's listings to tenants, and confirming payments. We don't sell your data.",
        },
        {
          heading: "Your choices",
          body: "You can update your name, email and phone from your profile at any time. To close your account, email support@rentnest.com.",
        },
      ]}
    />
  );
}
