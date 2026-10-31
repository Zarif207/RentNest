import { SearchX } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ActiveFilters } from "@/components/properties/browse/active-filters";
import { BrowseProvider } from "@/components/properties/browse/browse-context";
import { FilterSidebar } from "@/components/properties/browse/filter-sidebar";
import { ClearFiltersButton, ResultsShell } from "@/components/properties/browse/results-shell";
import { ResultsToolbar } from "@/components/properties/browse/results-toolbar";
import { ListingTabs } from "@/components/properties/listing-tabs";
import { PropertyGrid } from "@/components/properties/property-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getPublicCategories, getPublicProperties, orNull } from "@/lib/data/public";
import { COMMON_AMENITIES, getActiveChips, readFilters, toPropertyQuery } from "@/lib/property-filters";
import type { ListingType } from "@/types";

type RawParams = Record<string, string | string[] | undefined>;

/** The browse pages: /rent, /buy and /properties (both). */
export type BrowsePath = "/rent" | "/buy" | "/properties";

const TABS: { value: ListingType | null; label: string; path: BrowsePath }[] = [
  { value: "RENT", label: "Rent", path: "/rent" },
  { value: "SALE", label: "Buy", path: "/buy" },
  { value: null, label: "All", path: "/properties" },
];

/** Switching type keeps every filter except price (rent and sale use different scales) and the page. */
function tabHref(path: BrowsePath, params: RawParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (["minPrice", "maxPrice", "page"].includes(key) || value === undefined) continue;
    query.set(key, Array.isArray(value) ? value[0] : value);
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

const EMPTY_COPY: Record<"RENT" | "SALE" | "ALL", { title: string; description: string }> = {
  RENT: {
    title: "No rentals match your filters",
    description: "Try a different city or state, widen the rent range or remove a few amenities.",
  },
  SALE: {
    title: "No homes for sale match your filters",
    description: "Try a different city or state, widen the price range or remove a few amenities.",
  },
  ALL: {
    title: "No properties match your filters",
    description: "Try a different city or state, or remove a few filters.",
  },
};

/**
 * One browse page: header (with the Rent | Buy | All tabs), filter sidebar,
 * sticky toolbar and the paginated grid. `listingType` is fixed by the route.
 */
export async function BrowsePage({
  listingType,
  pathname,
  params,
  eyebrow,
  title,
  intro,
}: {
  listingType: ListingType | null;
  pathname: BrowsePath;
  params: RawParams;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
}) {
  const filters = readFilters(params, listingType);

  // A failed listing request goes to error.tsx; categories are optional.
  const [result, categories] = await Promise.all([
    getPublicProperties(toPropertyQuery(filters, listingType)),
    orNull(getPublicCategories()),
  ]);

  // Amenity options: common ones, those on this page's results, and any selected.
  const amenities = [
    ...new Set([
      ...COMMON_AMENITIES,
      ...result.data.flatMap((property) => property.amenities.map((a) => a.toLowerCase())),
      ...filters.amenities,
    ]),
  ].sort();
  const filterOptions = { categories: categories ?? [], amenities };
  const hasFilters = getActiveChips(filters, filterOptions.categories).length > 0;
  const empty = EMPTY_COPY[listingType ?? "ALL"];

  return (
    <PageShell>
      <header className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
        <div className="max-w-2xl space-y-4">
          <ListingTabs
            active={listingType}
            tabs={TABS.map((tab) => ({ value: tab.value, label: tab.label, href: tabHref(tab.path, params) }))}
          />
          <p className="pt-2 text-xs font-medium tracking-[0.25em] text-bronze uppercase">{eyebrow}</p>
          <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="text-muted-foreground sm:text-lg">{intro}</p>
        </div>
        <p className="flex items-baseline gap-3" aria-hidden>
          <span className="font-serif text-7xl leading-none lining-nums tabular-nums sm:text-8xl">
            {String(result.meta.total).padStart(2, "0")}
          </span>
          <span className="text-sm text-muted-foreground">
            {result.meta.total === 1 ? "home" : "homes"}
            <br />
            {hasFilters ? "match" : "listed"}
          </span>
        </p>
      </header>

      <BrowseProvider listingType={listingType}>
        <div className="mt-10 grid gap-8 lg:grid-cols-[17.5rem_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <FilterSidebar {...filterOptions} />
          </aside>

          <section className="min-w-0 space-y-6" aria-labelledby="results-title">
            <h2 id="results-title" className="sr-only">
              Results
            </h2>
            {/* Sticky glass bar: count, sort, mobile filters and the active chips. */}
            <div className="sticky top-20 z-20 space-y-3 rounded-3xl border border-border bg-background/70 p-3 backdrop-blur-xl sm:px-4">
              <ResultsToolbar total={result.meta.total} {...filterOptions} />
              <ActiveFilters categories={filterOptions.categories} />
            </div>

            <ResultsShell>
              {result.data.length > 0 ? (
                <div className="space-y-12">
                  <PropertyGrid properties={result.data} eagerCount={3} />
                  <PaginationNav
                    page={result.meta.page}
                    totalPages={result.meta.totalPage}
                    params={params}
                    pathname={pathname}
                  />
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title={empty.title}
                  description={empty.description}
                  action={<ClearFiltersButton />}
                />
              )}
            </ResultsShell>
          </section>
        </div>
      </BrowseProvider>
    </PageShell>
  );
}
