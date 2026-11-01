import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, KeyRound, MapPin, Signature } from "lucide-react";
import { AmenityChip } from "@/components/properties/details/amenity-chip";
import { BookingCard } from "@/components/properties/details/booking-card";
import { PropertyGallery } from "@/components/properties/details/property-gallery";
import { PropertyLocation } from "@/components/properties/details/property-location";
import { NearbyHomes } from "@/components/properties/details/nearby-homes";
import { LandlordCard } from "@/components/properties/details/landlord-card";
import { MortgageCalculator } from "@/components/properties/details/mortgage-calculator";
import { SaleCard } from "@/components/properties/details/sale-card";
import { PropertyReviews } from "@/components/properties/details/property-reviews";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPublicMapProperties, getPublicProperties, getPublicProperty, getPublicPropertyReviews, orNull } from "@/lib/data/public";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
import { LISTING_LABELS, LISTING_PATHS, listingPriceLabel, listingSummary } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, listingLd } from "@/lib/structured-data";
import { stateSlug } from "@/lib/us-states";
import { formatLocation } from "@/lib/us-states";
import { isUuid } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";

async function loadProperty(id: string) {
  // Skip the API call for ids that can't exist.
  return isUuid(id) ? getPublicProperty(id) : null;
}

/**
 * Prerender the current listings at build time, so their HTML (and the hero
 * photo's preload) is ready at once instead of streaming in after the data
 * fetch; that late preload was most of the details page's mobile LCP. New
 * listings still render on demand, and PROPERTIES_TAG keeps all of them fresh.
 */
export async function generateStaticParams() {
  const listings = await orNull(getPublicProperties({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }));
  return (listings?.data ?? []).map((property) => ({ id: property.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) return { title: "Property not found" };

  // e.g. "3-bed house for sale in Austin, TX · $450,000"; the share image is
  // this route's opengraph-image (photo, price and city).
  return pageMetadata({
    title: `${listingSummary(property)} · ${listingPriceLabel(property)}`,
    description: `${property.title}. ${property.description}`.slice(0, 160),
    path: `/properties/${property.id}`,
    image: "route",
  });
}

export default async function PropertyDetailsPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) notFound();

  const [reviews, pins] = await Promise.all([
    orNull(getPublicPropertyReviews(property.id)),
    orNull(getPublicMapProperties()),
  ]);
  const location = formatLocation(property.city, property.division);
  const typeLabel = formatEnumLabel(property.propertyType);
  const forSale = property.listingType === "SALE";
  const browsePath = LISTING_PATHS[property.listingType];

  const details = [
    { label: "Property type", value: typeLabel },
    { label: "Category", value: property.category?.name ?? "Uncategorized" },
    { label: "Area", value: `${formatNumber(property.area)} sq ft` },
    { label: "Listed", value: formatDate(property.createdAt) },
  ];

  return (
    <PageShell width="full">
      <JsonLd
        data={[
          listingLd(property),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: forSale ? "Buy" : "Rent", path: browsePath },
            { name: property.division, path: `${browsePath}/${stateSlug(property.division)}` },
            { name: property.title, path: `/properties/${property.id}` },
          ]),
        ]}
      />
      <header className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <Link
          href={browsePath}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to homes {forSale ? "for sale" : "for rent"}
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{LISTING_LABELS[property.listingType]}</Badge>
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
          <FavoriteButton propertyId={property.id} title={property.title} size="lg" />
        </div>
      </header>

      {/* Rented and sold homes are only reachable by direct link now; say why nothing can be booked. */}
      {property.availabilityStatus !== "AVAILABLE" && (
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p
            role="status"
            className="flex items-start gap-3 rounded-3xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm"
          >
            {property.availabilityStatus === "SOLD" ? (
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-bronze" aria-hidden />
            ) : property.availabilityStatus === "RENTED" ? (
              <KeyRound className="mt-0.5 size-5 shrink-0 text-bronze" aria-hidden />
            ) : (
              <Signature className="mt-0.5 size-5 shrink-0 text-bronze" aria-hidden />
            )}
            <span>
              <span className="font-medium">
                {property.availabilityStatus === "SOLD"
                  ? "Sold."
                  : property.availabilityStatus === "RENTED"
                    ? "Rented."
                    : "Under contract."}
              </span>{" "}
              {property.availabilityStatus === "SOLD"
                ? "This home has been sold and is no longer taking offers."
                : property.availabilityStatus === "RENTED"
                  ? "Someone is living here now, so it isn't taking rental requests."
                  : "A buyer's deposit has been paid, so this home isn't taking new offers."}
            </span>
          </p>
        </div>
      )}

      {/* Full-bleed: the gallery runs nearly edge to edge. */}
      <div className="mt-8 px-2 sm:px-3">
        <PropertyGallery images={property.images} title={property.title} summary={listingSummary(property)} />
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

          {forSale && Number(property.salePrice) > 0 && (
            <section aria-labelledby="mortgage-heading" className="space-y-5">
              <div className="space-y-1">
                <h2 id="mortgage-heading" className="text-3xl font-medium tracking-tighter">
                  Estimate your payment
                </h2>
                <p className="text-muted-foreground">Try your own down payment, rate and term.</p>
              </div>
              <MortgageCalculator price={Number(property.salePrice)} />
            </section>
          )}

          <section aria-labelledby="location-heading" className="space-y-5">
            <div className="space-y-1">
              <h2 id="location-heading" className="text-3xl font-medium tracking-tighter">
                Location
              </h2>
              <p className="text-muted-foreground">
                {property.address}, {location}
              </p>
            </div>
            <PropertyLocation property={property} pins={pins ?? []} />
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
          {forSale ? <SaleCard property={property} /> : <BookingCard property={property} />}
        </aside>
      </div>

      <Suspense fallback={null}>
        <NearbyHomes property={property} />
      </Suspense>
    </PageShell>
  );
}
