import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { ActiveFilters } from "@/components/properties/browse/active-filters";
import { BrowseProvider } from "@/components/properties/browse/browse-context";
import { PropertyFilters } from "@/components/properties/browse/property-filters";
import { ClearFiltersButton, ResultsShell } from "@/components/properties/browse/results-shell";
import { ResultsToolbar } from "@/components/properties/browse/results-toolbar";
import { PropertyGrid } from "@/components/properties/property-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { SerifAccent } from "@/components/shared/serif-accent";
import { getPublicCategories, getPublicProperties, orNull } from "@/lib/data/public";
import { COMMON_AMENITIES, getActiveChips, readFilters, toPropertyQuery } from "@/lib/property-filters";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse rental homes across the US by city, price, type and amenities.",
};

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const params = await searchParams;
  const filters = readFilters(params);

  // A failed listing request goes to error.tsx; categories are optional.
  const [result, categories] = await Promise.all([
    getPublicProperties(toPropertyQuery(filters)),
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

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Browse homes</p>
          <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter sm:text-6xl lg:text-7xl">
            Find your next <SerifAccent>home</SerifAccent>
          </h1>
          <p className="text-muted-foreground sm:text-lg">
            Filter by location, budget, type and amenities. Every filter is saved in the link, so you can
            share a search or come back to it.
          </p>
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

      <BrowseProvider>
        <div className="mt-10 grid gap-8 lg:grid-cols-[17.5rem_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto rounded-3xl border border-border bg-card p-5 scrollbar-thin">
              <PropertyFilters {...filterOptions} />
            </div>
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
                    pathname="/properties"
                  />
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No properties match your filters"
                  description="Try a different city or state, widen the price range or remove a few amenities."
                  action={<ClearFiltersButton />}
                />
              )}
            </ResultsShell>
          </section>
        </div>
      </BrowseProvider>
    </div>
  );
}
