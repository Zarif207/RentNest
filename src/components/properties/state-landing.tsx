import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/properties/property-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import { getPublicProperties, getPublicPropertyStates, orNull } from "@/lib/data/public";
import { formatCurrency } from "@/lib/format";
import { LISTING_PATHS, listingPrice } from "@/lib/listing";
import { stateSlug, US_STATES } from "@/lib/us-states";
import type { ListingType, PropertyWithRelations } from "@/types";

// The newest homes shown on a state page; the full, filterable list is a link away.
const GRID_LIMIT = 12;

const NOUNS: Record<ListingType, { plural: string; heading: string; price: string; suffix: string }> = {
  RENT: { plural: "homes for rent", heading: "Homes for rent in", price: "Rents start at", suffix: "/mo" },
  SALE: { plural: "homes for sale", heading: "Homes for sale in", price: "Prices start at", suffix: "" },
};

/** Every listing of this type in the state (the API caps a page at 100). */
export function loadStateListings(listingType: ListingType, state: string) {
  return getPublicProperties({ listingType, division: state, limit: 100, sortBy: "createdAt", sortOrder: "desc" });
}

/**
 * State pages to prerender: the states with listings of this type, or (while
 * a type has none yet) the states with any listings, so the build always has
 * at least one page.
 */
export async function stateParams(listingType: ListingType) {
  const [ofType, any] = await Promise.all([
    orNull(getPublicPropertyStates(listingType)),
    orNull(getPublicPropertyStates()),
  ]);
  const states = ofType?.length ? ofType : (any ?? []);
  const slugs = states.map((item) => stateSlug(item.state));
  return (slugs.length ? slugs : [stateSlug(US_STATES[0].name)]).map((state) => ({ state }));
}

/** The intro paragraph, from real numbers: count, cities and the lowest available price. */
export function stateIntro(listingType: ListingType, state: string, listings: PropertyWithRelations[]) {
  const noun = NOUNS[listingType];
  if (listings.length === 0) {
    return `There are no ${noun.plural} in ${state} on RentNest right now. New listings show up here as soon as they're posted.`;
  }
  const cities = [...new Set(listings.map((property) => property.city))].sort();
  const cityList =
    cities.length <= 3 ? cities.join(", ").replace(/, ([^,]*)$/, " and $1") : `${cities.slice(0, 3).join(", ")} and more`;
  const prices = listings
    .filter((property) => property.availabilityStatus === "AVAILABLE")
    .map((property) => Number(listingPrice(property)))
    .filter((price) => price > 0);
  const count = `${listings.length} ${listings.length === 1 ? noun.plural.replace("homes", "home") : noun.plural}`;
  const from = prices.length ? ` ${noun.price} ${formatCurrency(Math.min(...prices))}${noun.suffix}.` : "";
  return `${count} in ${state}, in ${cityList}.${from}`;
}

/** /rent/[state] and /buy/[state]: a headline, the intro and the newest listings. */
export async function StateLanding({ listingType, state }: { listingType: ListingType; state: string }) {
  const result = await loadStateListings(listingType, state);
  const noun = NOUNS[listingType];
  const browsePath = LISTING_PATHS[listingType];
  const filtered = `${browsePath}?division=${encodeURIComponent(state)}`;

  return (
    <PageShell>
      <header className="max-w-3xl space-y-5 border-b border-border pb-10">
        <Link
          href={browsePath}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> All {noun.plural}
        </Link>
        <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter sm:text-6xl lg:text-7xl">
          {noun.heading} <SerifAccent>{state}</SerifAccent>
        </h1>
        <p className="text-muted-foreground sm:text-lg">{stateIntro(listingType, state, result.data)}</p>
      </header>

      <section aria-label={`${noun.plural} in ${state}`} className="mt-12 space-y-10">
        {result.data.length > 0 ? (
          <>
            <PropertyGrid properties={result.data.slice(0, GRID_LIMIT)} eagerCount={3} />
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href={filtered}>
                  {result.meta.total > GRID_LIMIT ? `See all ${result.meta.total} with filters` : "Refine with filters"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title={`No ${noun.plural} in ${state} yet`}
            description="Try another state, or browse every listing."
            action={
              <Button asChild>
                <Link href={browsePath}>Browse all {noun.plural}</Link>
              </Button>
            }
          />
        )}
      </section>
    </PageShell>
  );
}
