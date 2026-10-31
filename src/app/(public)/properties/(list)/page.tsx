import type { Metadata } from "next";
import { BrowsePage } from "@/components/properties/browse/browse-page";
import { SerifAccent } from "@/components/shared/serif-accent";
import { pageMetadata } from "@/lib/seo";

// Static, so it's in <head>. Lists narrowed by several filters get a
// noindex header from the proxy instead (canonical stays the bare path).
export const metadata: Metadata = pageMetadata({
  title: "Properties",
  description: "Browse homes for rent and for sale across the US by city, price, type and amenities.",
  path: "/properties",
});

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
