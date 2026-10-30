import Link from "next/link";
import { House } from "lucide-react";
import { CityExplorer, type ExploreCity } from "@/components/home/city-explorer";
import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturedCollection, type FeaturedHome } from "@/components/home/featured-collection";
import { Hero, type HeroCard } from "@/components/home/hero";
import type { HeroSuggestion } from "@/components/home/hero-search";
import { HomeFaq, type FaqItem } from "@/components/home/home-faq";
import { HomeStatement } from "@/components/home/home-statement";
import { HowItWorks } from "@/components/home/how-it-works";
import type { MockListing } from "@/components/home/how-it-works-mocks";
import { ListingsMarquee } from "@/components/home/listings-marquee";
import { LiveStats } from "@/components/home/live-stats";
import { PropertyTypes, type TypeTile } from "@/components/home/property-types";
import { Voices, type Voice, type VoicesSummary } from "@/components/home/voices";
import { WhyRentNest } from "@/components/home/why-rentnest";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import {
  getPublicHomepage,
  getPublicProperties,
  getPublicPropertyReviews,
  getPublicPropertyStates,
  orNull,
} from "@/lib/data/public";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { toLiveStats } from "@/lib/live-stats";
import { formatLocation } from "@/lib/us-states";
import {
  PROPERTY_TYPES,
  type Paginated,
  type PropertyStateCount,
  type PropertyType,
  type PropertyWithRelations,
} from "@/types";

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


/**
 * Hero search suggestions: every state with listings (from /properties/states)
 * plus each distinct city, with how many homes each has.
 */
function toHeroSuggestions(
  states: PropertyStateCount[],
  properties: PropertyWithRelations[],
): HeroSuggestion[] {
  const cities = new Map<string, Extract<HeroSuggestion, { kind: "city" }>>();
  for (const { city, division } of properties) {
    if (!city) continue;
    const key = `${city}|${division}`.toLowerCase();
    const existing = cities.get(key);
    if (existing) existing.count += 1;
    else cities.set(key, { kind: "city", city, state: division, label: formatLocation(city, division), count: 1 });
  }
  return [
    ...states.map((state) => ({ kind: "state" as const, state: state.state, count: state.propertyCount })),
    ...cities.values(),
  ];
}

/** Hero cards: the admin's picks, in order (only ones with a photo; up to three). */
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


// Reviews are fetched per listing, so cap how many listings we ask about.
const VOICE_SOURCES = 24;

/** Real reviews across listings (newest first) plus the truthful summary shown without them. */
async function loadVoices(properties: PropertyWithRelations[]) {
  const sources = properties.slice(0, VOICE_SOURCES);
  const reviewLists = await Promise.all(
    sources.map((property) => orNull(getPublicPropertyReviews(property.id))),
  );

  const voices: Voice[] = reviewLists
    .flatMap((reviews, index) => (reviews ?? []).map((review) => ({ review, property: sources[index] })))
    .sort((a, b) => b.review.createdAt.localeCompare(a.review.createdAt))
    .map(({ review, property }) => ({
      id: review.id,
      quote: review.comment,
      name: review.user.name,
      property: property.title,
      propertyId: property.id,
      rating: review.rating,
    }));

  const summary: VoicesSummary = {
    count: voices.length,
    average: voices.length ? voices.reduce((sum, voice) => sum + voice.rating, 0) / voices.length : null,
    cities: new Set(properties.map((property) => `${property.city}|${property.division}`)).size,
    states: new Set(properties.map((property) => property.division)).size,
  };

  return { voices: voices.slice(0, 8), summary };
}

/** FAQ answers match how the app and backend actually behave. */
function toFaq(cities: ExploreCity[]): FaqItem[] {
  const cityList = cities.map((city) => city.label).join("; ");
  return [
    {
      question: "How does requesting a home work?",
      answer:
        "Open a listing, pick a move-in date and lease length, and send your request. The landlord sees it in their dashboard and approves or rejects it, and you can follow its status in yours.",
    },
    {
      question: "How does payment work?",
      answer:
        "Once your request is approved, a Pay now button appears. You pay the full lease total (monthly rent × lease months) in USD through Stripe Checkout, and the rental becomes active as soon as the payment is confirmed.",
    },
    {
      question: "Are payments secure?",
      answer:
        "Yes. You enter your card on Stripe's own hosted checkout page, so your card details never reach RentNest. You're never charged before a landlord approves your request.",
    },
    {
      question: "Can I cancel a request?",
      answer:
        "Requests can't be withdrawn from the app yet. Nothing is charged while a request is pending, though, and if you don't pay an approved request, it simply never becomes active.",
    },
    {
      question: "How do landlords join RentNest?",
      answer:
        "Landlords sign up with a landlord account and can list homes right away. Admins can see every account and listing, and block any account that breaks the rules.",
    },
    {
      question: "Which cities can I rent in?",
      answer: cityList
        ? `Homes are currently listed in ${cityList}. New cities appear as landlords list them.`
        : "New cities appear as landlords list homes across the US.",
    },
  ];
}

export default async function HomePage() {
  const [featured, latest, available, all, typeTotals, homepage, states] = await Promise.all([
    orNull(getPublicProperties({ limit: 8 })),
    orNull(getPublicProperties({ limit: 10, sortBy: "createdAt", sortOrder: "desc" })),
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
    orNull(getPublicProperties({ limit: 100 })),
    Promise.all(PROPERTY_TYPES.map((propertyType) => orNull(getPublicProperties({ propertyType, limit: 1 })))),
    orNull(getPublicHomepage()),
    orNull(getPublicPropertyStates()),
  ]);

  const { voices, summary } = await loadVoices(all?.data ?? []);
  const featuredHomes = toFeaturedHomes(featured?.data ?? []);
  const exploreCities = toExploreCities(all?.data ?? []);
  const mockListing = toMockListing(featured?.data ?? []);

  return (
    <>
      <Hero
        suggestions={toHeroSuggestions(states ?? [], all?.data ?? [])}
        // The admin's hero picks; if the settings can't load, the newest listings.
        cards={toHeroCards(homepage?.hero.properties ?? featured?.data ?? [])}
      />

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

      <HowItWorks listing={mockListing} />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Why RentNest"
              title={
                <>
                  Renting, <SerifAccent>without the runaround</SerifAccent>
                </>
              }
            />
          </FadeIn>
          <WhyRentNest
            rent={mockListing.rent}
            photos={(all?.data ?? []).flatMap((property) => property.images.slice(0, 1)).slice(0, 3)}
          />
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Voices"
              title={
                <>
                  In their <SerifAccent>own words</SerifAccent>
                </>
              }
              description="Reviews come only from tenants who rented the home through RentNest."
            />
          </FadeIn>
          <Voices items={voices} summary={summary} />
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="FAQ"
              title={
                <>
                  Questions, <SerifAccent>answered</SerifAccent>
                </>
              }
              description="Straight answers about requests, payments and listings."
            />
          </FadeIn>
          <FadeIn>
            <HomeFaq items={toFaq(exploreCities)} />
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
