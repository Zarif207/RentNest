import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, House, MapPin, Ruler } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

const PROPERTY_CARD_IMAGE_SIZES =
  "(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw";

/**
 * Listing card: photo with zoom, gold price tag, availability and a
 * favorite heart (local only). The whole card is one link (stretched over
 * the card) with the heart layered above it; it tilts in 3D on desktop.
 */
export function PropertyCard({
  property,
  eager = false,
}: {
  property: Property;
  /** Above-the-fold cards load their photo immediately (it's often the LCP). */
  eager?: boolean;
}) {
  const image = property.images[0];
  const available = property.availabilityStatus === "AVAILABLE";

  return (
    <TiltCard max={5} className="h-full rounded-3xl">
      <article className="group relative flex h-full flex-col rounded-3xl border border-border bg-card p-2 transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:hover:shadow-black/40">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <Image
              src={image}
              alt={property.title}
              fill
              loading={eager ? "eager" : undefined}
              sizes={PROPERTY_CARD_IMAGE_SIZES}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <House className="size-10" aria-hidden />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", available ? "bg-[#7f9a6b]" : "bg-muted-foreground")}
            />
            {available ? "Available" : "Rented"}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-gold px-3.5 py-1.5 text-sm font-semibold text-gold-foreground shadow-lg shadow-black/20">
            {formatCurrency(property.rentAmount)}
            <span className="font-normal opacity-80">/mo</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
          <h3 className="line-clamp-1 text-lg font-medium tracking-tight">
            <Link
              href={`/properties/${property.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-3xl"
            >
              {property.title}
            </Link>
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{formatLocation(property.city, property.division)}</span>
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5 text-sm text-muted-foreground">
            <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
              <li className="flex items-center gap-1.5" title="Bedrooms">
                <BedDouble className="size-4" aria-hidden />
                {property.bedrooms} <span className="sr-only">bedrooms</span>
              </li>
              <li className="flex items-center gap-1.5" title="Bathrooms">
                <Bath className="size-4" aria-hidden />
                {property.bathrooms} <span className="sr-only">bathrooms</span>
              </li>
              <li className="flex items-center gap-1.5" title="Area">
                <Ruler className="size-4" aria-hidden />
                {formatNumber(property.area)} sq ft
              </li>
            </ul>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>

        <FavoriteButton title={property.title} className="absolute top-5 right-5 z-10" />
      </article>
    </TiltCard>
  );
}
