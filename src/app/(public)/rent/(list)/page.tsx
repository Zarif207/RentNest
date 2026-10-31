import type { Metadata } from "next";
import { BrowsePage } from "@/components/properties/browse/browse-page";
import { SerifAccent } from "@/components/shared/serif-accent";
import { browseMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: PageProps<"/rent">): Promise<Metadata> {
  return browseMetadata(
    {
      title: "Homes for rent",
      description: "Rental homes across the US: filter by city, monthly rent, type and amenities, then request online.",
      path: "/rent",
    },
    await searchParams,
  );
}

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
