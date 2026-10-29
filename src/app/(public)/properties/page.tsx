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
import { COMMON_AMENITIES, readFilters, toPropertyQuery } from "@/lib/property-filters";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your next <SerifAccent>home</SerifAccent>
        </h1>
        <p className="text-muted-foreground sm:text-lg">
          Filter by location, budget, type and amenities. Every filter is saved in the
          link, so you can share a search or come back to it.
        </p>
      </header>

      <BrowseProvider>
        <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pr-3 pb-6 scrollbar-thin">
              <PropertyFilters {...filterOptions} />
            </div>
          </aside>

          <section className="min-w-0 space-y-6" aria-label="Results">
            <ResultsToolbar total={result.meta.total} {...filterOptions} />
            <ActiveFilters categories={filterOptions.categories} />

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
