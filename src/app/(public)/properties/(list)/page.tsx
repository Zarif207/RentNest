import type { Metadata } from "next";
import { BrowsePage } from "@/components/properties/browse/browse-page";
import { SerifAccent } from "@/components/shared/serif-accent";
import { browseMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: PageProps<"/properties">): Promise<Metadata> {
  return browseMetadata(
    {
      title: "Properties",
      description: "Browse homes for rent and for sale across the US by city, price, type and amenities.",
      path: "/properties",
    },
    await searchParams,
  );
}

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <BrowsePage
      listingType={null}
      pathname="/properties"
      params={await searchParams}
      eyebrow="Browse homes"
      title={
        <>
          Find your next <SerifAccent>home</SerifAccent>
        </>
      }
      intro="Homes to rent and to buy, in one place. Every filter is saved in the link, so you can share a search or come back to it."
    />
  );
}
