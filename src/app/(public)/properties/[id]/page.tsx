import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { AmenityChip } from "@/components/properties/details/amenity-chip";
import { BookingCard } from "@/components/properties/details/booking-card";
import { PropertyGallery } from "@/components/properties/details/property-gallery";
import { LandlordCard } from "@/components/properties/details/landlord-card";
import { PropertyReviews } from "@/components/properties/details/property-reviews";
import { PropertyGrid } from "@/components/properties/property-grid";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicProperties, getPublicProperty, getPublicPropertyReviews, orNull } from "@/lib/data/public";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { isUuid } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

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
      siteName: "RentNest",
      type: "website",
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
  };
}

/** Up to three other homes: same city first, then the same type, then the newest. */
async function loadSimilar(property: PropertyWithRelations) {
  const [sameCity, sameType, newest] = await Promise.all([
    orNull(getPublicProperties({ city: property.city, limit: 4 })),
    orNull(getPublicProperties({ propertyType: property.propertyType, limit: 4 })),
    orNull(getPublicProperties({ limit: 4, sortBy: "createdAt", sortOrder: "desc" })),
  ]);
  const seen = new Set([property.id]);
  const similar: PropertyWithRelations[] = [];
  for (const candidate of [...(sameCity?.data ?? []), ...(sameType?.data ?? []), ...(newest?.data ?? [])]) {
    if (similar.length === 3) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    similar.push(candidate);
  }
  return similar;
}

export default async function PropertyDetailsPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) notFound();

  const [reviews, similar] = await Promise.all([
    orNull(getPublicPropertyReviews(property.id)),
    loadSimilar(property),
  ]);
  const location = formatLocation(property.city, property.division);
  const typeLabel = formatEnumLabel(property.propertyType);

  const details = [
    { label: "Property type", value: typeLabel },
    { label: "Category", value: property.category?.name ?? "Uncategorized" },
    { label: "Area", value: `${formatNumber(property.area)} sq ft` },
    { label: "Listed", value: formatDate(property.createdAt) },
  ];

  return (
    <div className="pt-6 pb-20 sm:pt-10">
      <header className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to properties
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold">{typeLabel}</Badge>
              {/* Seeded categories often match the type ("Villa"); skip the duplicate. */}
              {property.category && property.category.name.toLowerCase() !== typeLabel.toLowerCase() && (
                <Badge variant="outline">{property.category.name}</Badge>
              )}
            </div>
            <h1 className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
              {property.title}
            </h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {property.address}, {location}
            </p>
          </div>
        </div>
      </header>

      {/* Full-bleed: the gallery runs nearly edge to edge. */}
      <div className="mt-8 px-2 sm:px-3">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:items-start lg:px-8">
        <div className="min-w-0 space-y-16">
          <section aria-labelledby="about-heading" className="space-y-5">
            <h2 id="about-heading" className="text-3xl font-medium tracking-tighter">
              About this home
            </h2>
            <p className="max-w-3xl text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
            <dl className="grid grid-cols-2 border-y border-border sm:grid-cols-4">
              {details.map((detail) => (
                <div key={detail.label} className="border-border py-5 pr-4 sm:border-r sm:pl-4 sm:first:pl-0 sm:last:border-r-0">
                  <dt className="text-xs tracking-[0.15em] text-muted-foreground uppercase">{detail.label}</dt>
                  <dd className="mt-1.5 font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="amenities-heading" className="space-y-5">
            <h2 id="amenities-heading" className="text-3xl font-medium tracking-tighter">
              Amenities
            </h2>
            {property.amenities.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {property.amenities.map((amenity) => (
                  <AmenityChip key={amenity} amenity={amenity} />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No amenities listed.</p>
            )}
          </section>

          <section aria-label="Landlord">
            <LandlordCard owner={property.owner} />
          </section>

          <section aria-labelledby="reviews-heading" className="space-y-5">
            <h2 id="reviews-heading" className="text-3xl font-medium tracking-tighter">
              Reviews
            </h2>
            <PropertyReviews reviews={reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <BookingCard property={property} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="mx-auto mt-24 max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Keep looking</p>
              <h2 id="similar-heading" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
                Similar <SerifAccent>homes</SerifAccent>
              </h2>
              <p className="text-muted-foreground">Same city first, then the same type, then the newest listings.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">
                View all <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <PropertyGrid properties={similar} />
        </section>
      )}
    </div>
  );
}
