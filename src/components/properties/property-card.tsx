import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, House, MapPin, Ruler } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const PROPERTY_CARD_IMAGE_SIZES =
  "(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw";

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images[0];
  const available = property.availabilityStatus === "AVAILABLE";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <article className="flex h-full flex-col gap-4 transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <Image
              src={image}
              alt={property.title}
              fill
              sizes={PROPERTY_CARD_IMAGE_SIZES}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <House className="size-10" aria-hidden />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                available ? "bg-[#7f9a6b]" : "bg-muted-foreground",
              )}
            />
            {available ? "Available" : "Rented"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-1">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">
            {property.title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{formatLocation(property.city, property.division)}</span>
          </p>
          <p className="line-clamp-1 text-sm text-muted-foreground">{property.description}</p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-1" title="Bedrooms">
                <BedDouble className="size-4" aria-hidden />
                {property.bedrooms} <span className="sr-only">bedrooms</span>
              </li>
              <li className="flex items-center gap-1" title="Bathrooms">
                <Bath className="size-4" aria-hidden />
                {property.bathrooms} <span className="sr-only">bathrooms</span>
              </li>
              <li className="flex items-center gap-1" title="Area">
                <Ruler className="size-4" aria-hidden />
                {formatNumber(property.area)} sq ft
              </li>
            </ul>
            <p className="shrink-0 text-xl font-bold whitespace-nowrap italic">
              {formatCurrency(property.rentAmount)}
              <span className="text-sm font-normal text-muted-foreground not-italic"> /mo</span>
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
