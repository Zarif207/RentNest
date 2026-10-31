"use client";

import { useState } from "react";
import { ListingsMarquee } from "@/components/home/listings-marquee";
import { ListingSwitch } from "@/components/properties/listing-switch";
import type { ListingType, Property } from "@/types";

/**
 * "Latest listings": the section heading with a Rent | Buy switch (when both
 * kinds exist) above the tilted marquee of the newest homes of that kind.
 */
export function LatestListings({
  heading,
  rent,
  sale,
}: {
  heading: React.ReactNode;
  rent: Property[];
  sale: Property[];
}) {
  const [mode, setMode] = useState<ListingType>(rent.length > 0 ? "RENT" : "SALE");
  const properties = mode === "RENT" ? rent : sale;

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {heading}
        {rent.length > 0 && sale.length > 0 && (
          <ListingSwitch value={mode} onChange={setMode} label="Latest homes to rent or buy" />
        )}
      </div>
      <div className="mt-16 sm:mt-24">
        {/* Keyed so switching restarts the loop with the new cards. */}
        <ListingsMarquee key={mode} properties={properties} />
      </div>
    </>
  );
}
