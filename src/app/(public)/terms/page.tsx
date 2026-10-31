import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description:
    "The rules for renting and listing homes on RentNest.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="October 30, 2026"
      sections={[
        {
          heading: "Accounts",
          body: "Tenants and landlords sign up for themselves. Keep your login private and your details accurate. Admins can block accounts that break these terms.",
        },
        {
          heading: "Listings",
          body: "Landlords are responsible for their listings: photos, rent, location and availability must be accurate, and only homes you're allowed to rent out may be listed.",
        },
        {
          heading: "Requests and payments",
          body: "A request isn't a lease until the landlord approves it and you pay. Payment is the full lease total in USD through Stripe, and the rental becomes active once it's confirmed.",
        },
        {
          heading: "Reviews",
          body: "Only tenants with an active or completed rental can review that home. Reviews should be honest and about the stay.",
        },
      ]}
    />
  );
}
