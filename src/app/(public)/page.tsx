import Link from "next/link";
import { House } from "lucide-react";
import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturedCollection, type FeaturedHome } from "@/components/home/featured-collection";
import { Hero, type HeroCard } from "@/components/home/hero";
import type { HeroCity } from "@/components/home/hero-search";
import { HomeStatement } from "@/components/home/home-statement";
import { HowItWorks } from "@/components/home/how-it-works";
import { ListingsMarquee } from "@/components/home/listings-marquee";
import { LiveStats, type LiveStat } from "@/components/home/live-stats";
import { Testimonials, type Testimonial } from "@/components/home/testimonials";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import { getPublicProperties, getPublicPropertyReviews, orNull } from "@/lib/data/public";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import type { Paginated, PropertyWithRelations } from "@/types";

// Shown only while there are fewer than three real reviews; worded as
// typical feedback rather than attributed to real people.
const GENERIC_TESTIMONIALS: Testimonial[] = [
  {
    id: "generic-1",
    quote: "Requesting a place took two minutes, and I knew the landlord's answer the same day.",
    name: "RentNest tenant",
    detail: "Typical tenant feedback",
    rating: 5,
  },
  {
    id: "generic-2",
    quote: "I list a unit, approve the right tenant and the payment lands through Stripe. No chasing.",
    name: "RentNest landlord",
    detail: "Typical landlord feedback",
    rating: 5,
  },
  {
    id: "generic-3",
    quote: "Real photos, clear prices and reviews from people who actually lived there.",
    name: "RentNest tenant",
    detail: "Typical tenant feedback",
    rating: 4,
  },
];

/** Unique cities from real listings, for the hero's city picker. */
function toHeroCities(properties: PropertyWithRelations[]): HeroCity[] {
  const byCity = new Map<string, string>();
  for (const { city, division } of properties) {
    if (city && !byCity.has(city)) byCity.set(city, formatLocation(city, division));
  }
  return [...byCity]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The first three featured listings that have a photo. */
function toHeroCards(properties: PropertyWithRelations[]): HeroCard[] {
  return properties
    .filter((property) => property.images.length > 0)
    .slice(0, 3)
    .map((property) => ({
      id: property.id,
      title: property.title,
      image: property.images[0],
      price: `${formatCurrency(property.rentAmount)}/mo`,
      location: formatLocation(property.city, property.division),
    }));
}

/** The featured collection's cards (real listings, up to eight). */
function toFeaturedHomes(properties: PropertyWithRelations[]): FeaturedHome[] {
  return properties.map((property) => ({
    id: property.id,
    title: property.title,
    image: property.images[0] ?? null,
    price: `${formatCurrency(property.rentAmount)}/mo`,
    location: formatLocation(property.city, property.division),
    type: formatEnumLabel(property.propertyType),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
  }));
}

/**
 * Platform numbers, only the ones we can count truthfully: totals come from
 * `meta.total`; cities and landlords only when every listing was fetched.
 */
function toLiveStats(
  all: Paginated<PropertyWithRelations> | null,
  available: Paginated<PropertyWithRelations> | null,
): LiveStat[] {
  const stats: LiveStat[] = [];
  if (all) {
    stats.push({ value: all.meta.total, label: "Homes listed", description: "Apartments, houses, studios and villas." });
  }
  if (available) {
    stats.push({ value: available.meta.total, label: "Available now", description: "Ready to request today." });
  }
  if (all && all.data.length === all.meta.total) {
    const cities = new Set(all.data.map((property) => `${property.city}|${property.division}`));
    const landlords = new Set(all.data.map((property) => property.ownerId));
    stats.push({ value: cities.size, label: "Cities covered", description: "Across different US states." });
    stats.push({ value: landlords.size, label: "Landlords listing", description: "Each one managing their own homes." });
  }
  return stats;
}

async function loadTestimonials(properties: PropertyWithRelations[]) {
  const reviewLists = await Promise.all(
    properties.map((property) => orNull(getPublicPropertyReviews(property.id))),
  );

  const reviews: Testimonial[] = reviewLists.flatMap((reviews, index) =>
    (reviews ?? []).map((review) => ({
      id: review.id,
      quote: review.comment,
      name: review.user.name,
      detail: `Tenant · ${properties[index].title}`,
      rating: review.rating,
    })),
  );

  return reviews.length >= 3 ? reviews.slice(0, 8) : GENERIC_TESTIMONIALS;
}

export default async function HomePage() {
  const [featured, latest, available, all] = await Promise.all([
    orNull(getPublicProperties({ limit: 8 })),
    orNull(getPublicProperties({ limit: 10, sortBy: "createdAt", sortOrder: "desc" })),
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
    orNull(getPublicProperties({ limit: 100 })),
  ]);

  const testimonials = await loadTestimonials(featured?.data ?? []);
  const featuredHomes = toFeaturedHomes(featured?.data ?? []);

  return (
    <>
      <Hero cities={toHeroCities(all?.data ?? [])} cards={toHeroCards(featured?.data ?? [])} />

      <HomeStatement />

      <LiveStats stats={toLiveStats(all, available)} />

      {featuredHomes.length > 0 ? (
        <FeaturedCollection homes={featuredHomes} />
      ) : (
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EmptyState
              icon={House}
              title={featured ? "No homes listed yet" : "Listings are unavailable right now"}
              description={
                featured
                  ? "New properties will appear here as soon as landlords list them."
                  : "We couldn't load properties. Please try again in a moment."
              }
              action={
                <Button asChild variant="outline">
                  <Link href="/properties">Browse properties</Link>
                </Button>
              }
            />
          </div>
        </section>
      )}

      {latest && latest.data.length > 0 && (
        <section className="overflow-hidden py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                eyebrow="Latest listings"
                title={
                  <>
                    Fresh on the market, <SerifAccent>just for you</SerifAccent>
                  </>
                }
              />
            </FadeIn>
          </div>
          <div className="mt-16 sm:mt-24">
            <ListingsMarquee properties={latest.data} />
          </div>
        </section>
      )}

      <HowItWorks />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Testimonials"
              title={
                <>
                  What people say <SerifAccent>after moving in</SerifAccent>
                </>
              }
              description="Stories from tenants and landlords who use RentNest."
            />
          </FadeIn>
          <FadeIn>
            <Testimonials items={testimonials} />
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
