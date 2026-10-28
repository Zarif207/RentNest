import Image from "next/image";
import Link from "next/link";
import { House } from "lucide-react";
import { formatLocation } from "@/lib/us-states";
import type { Property } from "@/types";

type PropertyCellProps = {
  property: Pick<Property, "id" | "title" | "images" | "city" | "division">;
};

/** Thumbnail, title (linking to the listing) and "City, ST". */
export function PropertyCell({ property }: PropertyCellProps) {
  const image = property.images[0];

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <House className="m-auto size-5 h-full text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <Link
          href={`/properties/${property.id}`}
          className="block truncate font-medium underline-offset-4 hover:underline"
        >
          {property.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {formatLocation(property.city, property.division)}
        </p>
      </div>
    </div>
  );
}
