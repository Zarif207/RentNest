import { Suspense } from "react";
import type { Metadata } from "next";
import { CtaBanner } from "@/components/home/cta-banner";
import { FeaturedCollection, type FeaturedHome } from "@/components/home/featured-collection";
import { Hero, type HeroCard } from "@/components/home/hero";
import type { HeroSuggestion } from "@/components/home/hero-search";
import { HomeFaq, type FaqItem } from "@/components/home/home-faq";
import { HomeSectionsSkeleton } from "@/components/home/home-sections-skeleton";
import { HomeStatement } from "@/components/home/home-statement";
import { HowItWorks } from "@/components/home/how-it-works";
import type { MockListing } from "@/components/home/how-it-works-mocks";
import { LatestListings } from "@/components/home/latest-listings";
import { LiveStats } from "@/components/home/live-stats";
import { PlaceExplorer, type ExplorePlace } from "@/components/home/place-explorer";
import { PropertyTypes, type TypeTile } from "@/components/home/property-types";
import { SellBand } from "@/components/home/sell-band";
import { Voices, type Voice, type VoicesSummary } from "@/components/home/voices";
import { WhyRentNest } from "@/components/home/why-rentnest";
import { JsonLd } from "@/components/seo/json-ld";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import {
  getPublicHomepage,
  getPublicProperties,
  getPublicPropertyReviews,
  getPublicPropertyStates,
  orNull,
} from "@/lib/data/public";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { listingPriceLabel } from "@/lib/listing";
import { toLiveStats } from "@/lib/live-stats";
import { pageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { faqLd, organizationLd, websiteLd } from "@/lib/structured-data";
import { formatLocation, stateSlug, US_STATES } from "@/lib/us-states";
import {
  HOMEPAGE_SECTIONS,
  PROPERTY_TYPES,
  type HomepageSection,
  type HomepageSettings,
  type PropertyStateCount,
  type PropertyType,
  type PropertyWithRelations,
} from "@/types";

export const metadata: Metadata = {
  ...pageMetadata({ title: `${SITE_NAME} — Rent or buy homes across the US`, description: SITE_DESCRIPTION, path: "/" }),
  // The home page's title stands alone (no " · RentNest" suffix).
  title: { absolute: `${SITE_NAME} — Rent or buy homes across the US` },
};

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

/** Hero mosaic: the admin's picks, in order (only ones with a photo; up to seven, one per piece). */
function toHeroCards(properties: PropertyWithRelations[]): HeroCard[] {
  return properties
    .filter((property) => property.images.length > 0)
    .slice(0, 7)
    .map((property) => ({
      id: property.id,
      title: property.title,
      image: property.images[0],
      price: listingPriceLabel(property),
      location: formatLocation(property.city, property.division),
    }));
}

/** The featured collection's cards (real listings, up to eight). */
function toFeaturedHomes(properties: PropertyWithRelations[]): FeaturedHome[] {
  return properties.map((property) => ({
    id: property.id,
    title: property.title,
    image: property.images[0] ?? null,
    price: listingPriceLabel(property),
    location: formatLocation(property.city, property.division),
    type: formatEnumLabel(property.propertyType),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
  }));
}

/**
 * State tiles from the admin's picks, with live counts and starting prices
 * for both listing types. A tile opens the state's rent page, or its buy
 * page when the state only has homes for sale.
 */
function toExplorePlaces(items: HomepageSettings["states"]["items"]): ExplorePlace[] {
  return items.map((item) => {
    const code = US_STATES.find((state) => state.name === item.state)?.code;
    const parts = [
      item.rent.count > 0 &&
        `${item.rent.count} for rent${item.rent.startingPrice ? ` from ${formatCurrency(item.rent.startingPrice)}/mo` : ""}`,
      item.sale.count > 0 &&
        `${item.sale.count} for sale${item.sale.startingPrice ? ` from ${formatCurrency(item.sale.startingPrice)}` : ""}`,
    ].filter(Boolean);
    const onlyForSale = item.rent.count === 0 && item.sale.count > 0;
    return {
      key: item.state,
      name: item.state,
      caption: code ? `${code} · United States` : "United States",
      detail: parts.length ? parts.join(" · ") : "No homes available right now",
      image: item.imageUrl,
      href: `${onlyForSale ? "/buy" : "/rent"}/${stateSlug(item.state)}`,
      hasHomes: parts.length > 0,
    };
  });
}

/** Property type tiles: the admin's images (or a listing photo) and live counts. */
function toTypeTiles(items: HomepageSettings["propertyTypes"]["items"]): TypeTile[] {
  return items.map((item) => ({
    type: item.type,
    label: formatEnumLabel(item.type),
    description: TYPE_DESCRIPTIONS[item.type],
    count: item.propertyCount,
    image: item.imageUrl ?? TYPE_FALLBACK_IMAGES[item.type],
  }));
}

/**
 * Used only if the homepage settings can't be loaded: the same defaults the
 * backend uses, built from the listings already fetched (newest first).
 */
function fallbackHomepage(properties: PropertyWithRelations[]): HomepageSettings {
  type Stats = { count: number; min: number | null };
  const byState = new Map<string, { rent: Stats; sale: Stats; image: string | null }>();
  for (const property of properties) {
    const entry = byState.get(property.division) ?? {
      rent: { count: 0, min: null },
      sale: { count: 0, min: null },
      image: null,
    };
    entry.image ??= property.images[0] ?? null;
    if (property.availabilityStatus === "AVAILABLE") {
      const stats = property.listingType === "SALE" ? entry.sale : entry.rent;
      const price = Number(property.listingType === "SALE" ? property.salePrice : property.rentAmount);
      stats.count += 1;
      stats.min = stats.min === null ? price : Math.min(stats.min, price);
    }
    byState.set(property.division, entry);
  }
  const toListingStats = (stats: Stats) => ({
    count: stats.count,
    startingPrice: stats.min === null ? null : String(stats.min),
  });
  const states = [...byState.entries()]
    .filter(([, entry]) => entry.image)
    .sort((a, b) => b[1].rent.count + b[1].sale.count - (a[1].rent.count + a[1].sale.count))
    .slice(0, 8)
    .map(([state, entry]) => ({
      state,
      imageUrl: entry.image as string,
      propertyCount: entry.rent.count,
      startingPrice: toListingStats(entry.rent).startingPrice,
      rent: toListingStats(entry.rent),
      sale: toListingStats(entry.sale),
    }));

  return {
    hero: { properties: properties.slice(0, 3) },
    featured: { enabled: true, title: null, properties: properties.slice(0, 8) },
    states: { enabled: states.length > 0, items: states },
    propertyTypes: {
      enabled: true,
      items: PROPERTY_TYPES.map((type) => ({
        type,
        imageUrl: properties.find((property) => property.propertyType === type)?.images[0] ?? null,
        propertyCount: properties.filter((property) => property.propertyType === type).length,
        rentCount: properties.filter((p) => p.propertyType === type && p.listingType === "RENT").length,
        saleCount: properties.filter((p) => p.propertyType === type && p.listingType === "SALE").length,
      })),
    },
    latest: { enabled: true, count: 8, properties: properties.slice(0, 8) },
    sectionOrder: [...HOMEPAGE_SECTIONS],
    isDefault: true,
    updatedAt: null,
  };
}

/** The real listing the how-it-works mocks are dressed with. */
function toMockListing(properties: PropertyWithRelations[]): MockListing {
  // The mocks walk through renting, so they use a rental.
  const rentals = properties.filter((item) => item.listingType === "RENT");
  const property = rentals.find((item) => item.images.length > 0) ?? rentals[0];
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
function toFaq(properties: PropertyWithRelations[]): FaqItem[] {
  const cityList = [...new Set(properties.map((property) => formatLocation(property.city, property.division)))]
    .sort()
    .join("; ");
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
      question: "How do offers work when buying?",
      answer:
        "On a home for sale, make an offer with your price and how you'll pay. The owner accepts it, declines it or counters with another price, and you can accept the counter. Offers with no reply for 7 days expire.",
    },
    {
      question: "What is the deposit?",
      answer:
        "Once a price is agreed, you pay an earnest-money deposit through Stripe Checkout: 1% of the agreed price, at least $500. Paying it puts the home under contract with you. The full price is never charged on RentNest.",
    },
    {
      question: "Can I withdraw an offer?",
      answer:
        "Yes, at any time before you pay the deposit, including after the owner accepts or counters. Once the deposit is paid, contact the owner, since deposits aren't refunded automatically.",
    },
    {
      question: "How long does buying take?",
      answer:
        "On RentNest it's as fast as you and the owner reply: offer, answer, deposit, and the owner marks the sale complete. Each step must happen within 7 days or the offer expires. The legal closing itself happens outside the app.",
    },
    {
      question: "How do landlords join RentNest?",
      answer:
        "Landlords and owners sign up with a landlord account, and an admin approves it before they can list homes for rent or for sale. Admins can see every account and listing, and block any account that breaks the rules.",
    },
    {
      question: "Where are homes listed?",
      answer: cityList
        ? `Homes are currently listed in ${cityList}. New cities appear as landlords and owners list them.`
        : "New cities appear as landlords and owners list homes across the US.",
    },
  ];
}

export default async function HomePage() {
  const [all, homepage, states] = await Promise.all([
    orNull(getPublicProperties({ limit: 100 })),
    orNull(getPublicHomepage()),
    orNull(getPublicPropertyStates()),
  ]);
  const listings = all?.data ?? [];
  // The admin's homepage config (revalidated every 60 s and on save).
  const settings = homepage ?? fallbackHomepage(listings);
  const showFaq = settings.sectionOrder.includes("faq");

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(), ...(showFaq ? [faqLd(toFaq(listings))] : [])]} />
      <Hero
        suggestions={toHeroSuggestions(states ?? [], listings)}
        cards={toHeroCards(settings.hero.properties)}
      />
      {/* Its own boundary, so the hero's HTML (the LCP) is revealed without
          waiting for the rest of the page's markup to arrive. */}
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeSections />
      </Suspense>
    </>
  );
}

/** Everything below the hero. The listing requests are cached, so they're shared with HomePage. */
async function HomeSections() {
  const [available, all, homepage] = await Promise.all([
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
    orNull(getPublicProperties({ limit: 100 })),
    orNull(getPublicHomepage()),
  ]);
  const listings = all?.data ?? [];
  const settings = homepage ?? fallbackHomepage(listings);
  const { voices, summary } = await loadVoices(listings);
  // Featured and latest, split by listing type for their Rent | Buy switches.
  // The admin's picks come first; with no sale picks, Buy shows the newest homes for sale.
  const byType = (properties: PropertyWithRelations[], type: "RENT" | "SALE") =>
    properties.filter((property) => property.listingType === type);
  const newestForSale = byType(listings, "SALE").filter((property) => property.availabilityStatus === "AVAILABLE");
  const featuredRent = toFeaturedHomes(byType(settings.featured.properties, "RENT"));
  const featuredSalePicks = byType(settings.featured.properties, "SALE");
  const featuredSale = toFeaturedHomes(featuredSalePicks.length > 0 ? featuredSalePicks : newestForSale.slice(0, 8));
  const latestCount = settings.latest.count;
  const latestRent = listings.length ? byType(listings, "RENT").slice(0, latestCount) : byType(settings.latest.properties, "RENT");
  const latestSale = listings.length ? byType(listings, "SALE").slice(0, latestCount) : byType(settings.latest.properties, "SALE");
  const places = toExplorePlaces(settings.states.items);
  const mockListing = toMockListing(settings.featured.properties.length > 0 ? settings.featured.properties : listings);
  const stats = toLiveStats(all, available);

  // Each section renders only when enabled and when it has something to show.
  const sections: Record<HomepageSection, () => React.ReactNode> = {
    statement: () => <HomeStatement />,
    stats: () => (stats.length > 0 ? <LiveStats stats={stats} /> : null),
    featured: () =>
      settings.featured.enabled && featuredRent.length + featuredSale.length > 0 ? (
        <FeaturedCollection rentHomes={featuredRent} saleHomes={featuredSale} title={settings.featured.title} />
      ) : null,
    states: () =>
      settings.states.enabled && places.length > 0 ? (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                eyebrow="Explore by state"
                title={
                  <>
                    Homes across <SerifAccent>the country</SerifAccent>
                  </>
                }
                description="Pick a state to see every home available there."
              />
            </FadeIn>
            <FadeIn>
              <PlaceExplorer places={places} />
            </FadeIn>
          </div>
        </section>
      ) : null,
    propertyTypes: () =>
      settings.propertyTypes.enabled && settings.propertyTypes.items.length > 0 ? (
        <section className="py-20 sm:py-28">
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
            <PropertyTypes types={toTypeTiles(settings.propertyTypes.items)} />
          </div>
        </section>
      ) : null,
    latest: () =>
      settings.latest.enabled && latestRent.length + latestSale.length > 0 ? (
        <section className="overflow-hidden py-20 sm:py-28">
          <LatestListings
            rent={latestRent}
            sale={latestSale}
            heading={
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
            }
          />
        </section>
      ) : null,
    howItWorks: () => <HowItWorks listing={mockListing} />,
    whyUs: () => (
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
            photos={listings.flatMap((property) => property.images.slice(0, 1)).slice(0, 3)}
          />
        </div>
      </section>
    ),
    reviews: () => (
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
    ),
    faq: () => (
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
              description="Straight answers about renting, buying, payments and listings."
            />
          </FadeIn>
          <FadeIn>
            <HomeFaq items={faq} />
          </FadeIn>
        </div>
      </section>
    ),
  };

  const faq = toFaq(listings);

  return (
    <>
      {/* Sections in the admin's order; anything left out of the order is hidden.
          On phones each one skips rendering until it nears the viewport (data-defer-render). */}
      {settings.sectionOrder.map((id) => {
        const section = sections[id]();
        return (
          section && (
            <div key={id} data-defer-render>
              {section}
            </div>
          )
        );
      })}

      <div data-defer-render>
        <SellBand />
        <CtaBanner />
      </div>
    </>
  );
}
