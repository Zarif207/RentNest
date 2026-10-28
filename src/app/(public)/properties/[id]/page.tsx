import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { AmenityChip } from "@/components/properties/details/amenity-chip";
import { BookingCard } from "@/components/properties/details/booking-card";
import { PropertyGallery } from "@/components/properties/details/property-gallery";
import { PropertyReviews } from "@/components/properties/details/property-reviews";
import { Badge } from "@/components/ui/badge";
import { getPublicProperty, getPublicPropertyReviews, orNull } from "@/lib/data/public";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { isUuid } from "@/lib/utils";

async function loadProperty(id: string) {
  // Skip the API call for ids that can't exist.
  return isUuid(id) ? getPublicProperty(id) : null;
}

/** OG images: ask Unsplash for a 1200px version instead of the multi-MB original. */
function ogImage(src: string | undefined) {
  if (!src) return undefined;
  const url = new URL(src);
  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("w", "1200");
    url.searchParams.set("q", "80");
    url.searchParams.set("auto", "format");
  }
  return url.toString();
}

export async function generateMetadata({
  params,
}: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) return { title: "Property not found" };

  const description = property.description.slice(0, 160);
  const image = ogImage(property.images[0]);

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      type: "website",
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
  };
}

export default async function PropertyDetailsPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) notFound();

  const reviews = await orNull(getPublicPropertyReviews(property.id));
  const location = formatLocation(property.city, property.division);
  const typeLabel = formatEnumLabel(property.propertyType);

  const details = [
    { label: "Property type", value: typeLabel },
    { label: "Category", value: property.category?.name ?? "Uncategorized" },
    { label: "Area", value: `${formatNumber(property.area)} sq ft` },
    { label: "Listed", value: formatDate(property.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to properties
      </Link>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{typeLabel}</Badge>
          {/* Seeded categories often match the type ("Villa"); skip the duplicate. */}
          {property.category && property.category.name.toLowerCase() !== typeLabel.toLowerCase() && (
            <Badge variant="outline">{property.category.name}</Badge>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{property.title}</h1>
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {property.address}, {location}
        </p>
      </header>

      <div className="mt-8">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="about-heading" className="space-y-4">
            <h2 id="about-heading" className="text-2xl font-semibold tracking-tight">
              About this home
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
            <dl className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {details.map((detail) => (
                <div key={detail.label} className="rounded-2xl bg-surface p-4">
                  <dt className="text-xs text-muted-foreground">{detail.label}</dt>
                  <dd className="mt-1 font-semibold">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="amenities-heading" className="space-y-4">
            <h2 id="amenities-heading" className="text-2xl font-semibold tracking-tight">
              Amenities
            </h2>
            {property.amenities.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <AmenityChip key={amenity} amenity={amenity} />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No amenities listed.</p>
            )}
          </section>

          <section aria-labelledby="reviews-heading" className="space-y-4">
            <h2 id="reviews-heading" className="text-2xl font-semibold tracking-tight">
              Reviews
            </h2>
            <PropertyReviews reviews={reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <BookingCard property={property} />
        </aside>
      </div>
    </div>
  );
}
