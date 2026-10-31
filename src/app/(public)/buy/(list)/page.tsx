import type { Metadata } from "next";
import { BrowsePage } from "@/components/properties/browse/browse-page";
import { SerifAccent } from "@/components/shared/serif-accent";
import { pageMetadata } from "@/lib/seo";

// Static, so it's in <head>. Lists narrowed by several filters get a
// noindex header from the proxy instead (canonical stays the bare path).
export const metadata: Metadata = pageMetadata({
  title: "Homes for sale",
  description: "Homes for sale across the US: filter by city, price, type and amenities, then make an offer online.",
  path: "/buy",
});

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  return (
    <BrowsePage
      listingType="SALE"
      pathname="/buy"
      params={await searchParams}
      eyebrow="Homes for sale"
      title={
        <>
          Find a home <SerifAccent>to own</SerifAccent>
        </>
      }
      intro="Filter by location, price, type and amenities. Make an offer online, agree on a price with the owner, and secure it with a small deposit."
    />
  );
}
