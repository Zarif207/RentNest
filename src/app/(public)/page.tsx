import Link from "next/link";
import { ArrowRight, House } from "lucide-react";
import { CategoryChips } from "@/components/home/category-chips";
import { CtaBanner } from "@/components/home/cta-banner";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { JourneyStats, type HomeStat } from "@/components/home/journey-stats";
import { ListingsMarquee } from "@/components/home/listings-marquee";
import { Testimonials, type Testimonial } from "@/components/home/testimonials";
import { PropertyGrid } from "@/components/properties/property-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import {
  getPublicCategories,
  getPublicProperties,
  getPublicPropertyReviews,
  orNull,
} from "@/lib/data/public";
import type { PropertyWithRelations } from "@/types";

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
  const [featured, latest, available, categories] = await Promise.all([
    orNull(getPublicProperties({ limit: 6 })),
    orNull(getPublicProperties({ limit: 10, sortBy: "createdAt", sortOrder: "desc" })),
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
    orNull(getPublicCategories()),
  ]);

  const testimonials = await loadTestimonials(featured?.data ?? []);

  const stats: HomeStat[] = [
    {
      value: featured?.meta.total ?? null,
      label: "Homes listed",
      description: "Apartments, houses, studios and villas.",
    },
    {
      value: available?.meta.total ?? null,
      label: "Available now",
      description: "Ready to request today.",
    },
    {
      value: categories?.length ?? null,
      label: "Property categories",
      description: "Find the kind of place that fits you.",
    },
  ];

  return (
    <>
      <Hero />

      <section className="pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Featured"
              title={
                <>
                  Discover handpicked homes that <SerifAccent>define elegance</SerifAccent>
                </>
              }
            />
            <Button asChild variant="outline" className="self-start lg:self-auto">
              <Link href="/properties">
                View all properties <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </FadeIn>

          {categories && categories.length > 0 && <CategoryChips categories={categories} />}

          {featured && featured.data.length > 0 ? (
            <PropertyGrid properties={featured.data} />
          ) : (
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
          )}
        </div>
      </section>

      {latest && latest.data.length > 0 && (
        <section className="overflow-hidden bg-surface py-20 sm:py-28">
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

      <JourneyStats stats={stats} />

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
