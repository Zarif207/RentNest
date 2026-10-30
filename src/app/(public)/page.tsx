import Link from "next/link";
import { House } from "lucide-react";
import { CityExplorer, type ExploreCity } from "@/components/home/city-explorer";
import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturedCollection, type FeaturedHome } from "@/components/home/featured-collection";
import { Hero, type HeroCard } from "@/components/home/hero";
import type { HeroCity } from "@/components/home/hero-search";
import { HomeStatement } from "@/components/home/home-statement";
import { HowItWorks } from "@/components/home/how-it-works";
import type { MockListing } from "@/components/home/how-it-works-mocks";
import { ListingsMarquee } from "@/components/home/listings-marquee";
import { LiveStats, type LiveStat } from "@/components/home/live-stats";
import { PropertyTypes, type TypeTile } from "@/components/home/property-types";
import { Testimonials, type Testimonial } from "@/components/home/testimonials";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import { getPublicProperties, getPublicPropertyReviews, orNull } from "@/lib/data/public";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { PROPERTY_TYPES, type Paginated, type PropertyType, type PropertyWithRelations } from "@/types";

// Used for a type tile only when no listing of that type has a photo yet.
const TYPE_FALLBACK_IMAGES: Record<PropertyType, string> = {
  APARTMENT: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  HOUSE: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  STUDIO: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  VILLA: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
};

const TYPE_DESCRIPTIONS: Record<PropertyType, string> = {
  APARTMENT: "City living close to work, food and transit.",
  HOUSE: "Room to grow, with a yard of your own.",
  STUDIO: "One smart space, close to everything.",
  VILLA: "Space, privacy and a pool for the long summer.",
};

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

/** Real listings grouped by city: the six with the most homes. */
function toExploreCities(properties: PropertyWithRelations[]): ExploreCity[] {
  const byCity = new Map<string, ExploreCity & { minRent: number }>();
  for (const property of properties) {
    const key = `${property.city}|${property.division}`;
    const rent = Number(property.rentAmount);
    const entry = byCity.get(key);
    if (entry) {
      entry.count += 1;
      entry.minRent = Math.min(entry.minRent, rent);
      entry.image ??= property.images[0] ?? null;
    } else {
      byCity.set(key, {
        city: property.city,
        label: formatLocation(property.city, property.division),
        count: 1,
        minRent: rent,
        startingPrice: "",
        image: property.images[0] ?? null,
      });
    }
  }
  return [...byCity.values()]
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
    .slice(0, 6)
    .map(({ minRent, ...city }) => ({ ...city, startingPrice: formatCurrency(minRent) }));
}

/** One tile per property type: count from `meta.total`, photo from a real listing. */
function toTypeTiles(
  properties: PropertyWithRelations[],
  totals: (Paginated<PropertyWithRelations> | null)[],
): TypeTile[] {
  return PROPERTY_TYPES.map((type, index) => ({
    type,
    label: formatEnumLabel(type),
    description: TYPE_DESCRIPTIONS[type],
    count: totals[index]?.meta.total ?? null,
    image:
      properties.find((property) => property.propertyType === type && property.images.length > 0)?.images[0] ??
      TYPE_FALLBACK_IMAGES[type],
  }));
}

/** The real listing the how-it-works mocks are dressed with. */
function toMockListing(properties: PropertyWithRelations[]): MockListing {
  const property = properties.find((item) => item.images.length > 0) ?? properties[0];
  if (!property) return { title: "Your next home", image: null, rent: 2400, location: "Denver, CO" };
  return {
    title: property.title,
    image: property.images[0] ?? null,
    rent: Number(property.rentAmount),
    location: formatLocation(property.city, property.division),
  };
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
  const [featured, latest, available, all, typeTotals] = await Promise.all([
    orNull(getPublicProperties({ limit: 8 })),
    orNull(getPublicProperties({ limit: 10, sortBy: "createdAt", sortOrder: "desc" })),
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
    orNull(getPublicProperties({ limit: 100 })),
    Promise.all(PROPERTY_TYPES.map((propertyType) => orNull(getPublicProperties({ propertyType, limit: 1 })))),
  ]);

  const testimonials = await loadTestimonials(featured?.data ?? []);
  const featuredHomes = toFeaturedHomes(featured?.data ?? []);
  const exploreCities = toExploreCities(all?.data ?? []);

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

      {exploreCities.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                eyebrow="Explore by city"
                title={
                  <>
                    Homes across <SerifAccent>the country</SerifAccent>
                  </>
                }
                description="Pick a city to see every home listed there."
              />
            </FadeIn>
            <FadeIn>
              <CityExplorer cities={exploreCities} />
            </FadeIn>
          </div>
        </section>
      )}

      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Property types"
              title={
                <>
                  A place for <SerifAccent>every chapter</SerifAccent>
                </>
              }
            />
          </FadeIn>
          <PropertyTypes types={toTypeTiles(all?.data ?? [], typeTotals)} />
        </div>
      </section>

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

      <HowItWorks listing={toMockListing(featured?.data ?? [])} />

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
