import type { Metadata } from "next";
import { BrowsePage } from "@/components/properties/browse/browse-page";
import { SerifAccent } from "@/components/shared/serif-accent";
import { pageMetadata } from "@/lib/seo";

// Static, so it's in <head>. Lists narrowed by several filters get a
// noindex header from the proxy instead (canonical stays the bare path).
export const metadata: Metadata = pageMetadata({
  title: "Homes for rent",
  description: "Rental homes across the US: filter by city, monthly rent, type and amenities, then request online.",
  path: "/rent",
});

export default async function RentPage({ searchParams }: PageProps<"/rent">) {
  return (
    <BrowsePage
      listingType="RENT"
      pathname="/rent"
      params={await searchParams}
      eyebrow="Homes for rent"
      title={
        <>
          Rent your next <SerifAccent>home</SerifAccent>
        </>
      }
      intro="Filter by location, monthly rent, type and amenities. Request a home in minutes and pay once the landlord says yes."
    />
  );
}
