import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import { PropertyGrid } from "@/components/properties/property-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";
import { getPublicProperties, orNull } from "@/lib/data/public";
import { LISTING_PATHS } from "@/lib/listing";
import { normalizeUsState, stateSlug } from "@/lib/us-states";
import type { PropertyWithRelations } from "@/types";

const LIMIT = 4;

/**
 * Up to four other public homes of the same listing type in the same state
 * (matched like the state pages, so "Florida, FL" and "FL" are one state),
 * topped up from the same city when the state has fewer than three.
 */
async function loadNearby(property: PropertyWithRelations, state: string | null) {
  const { listingType } = property;
  const divisions = [...new Set([state, property.division].filter((value): value is string => Boolean(value)))];
  const [byState, byCity] = await Promise.all([
    Promise.all(divisions.map((division) => orNull(getPublicProperties({ listingType, division, limit: 12 })))),
    orNull(getPublicProperties({ listingType, city: property.city, limit: 12 })),
  ]);

  const seen = new Set([property.id]);
  const pick = (candidates: PropertyWithRelations[], into: PropertyWithRelations[]) => {
    for (const candidate of candidates) {
      if (into.length === LIMIT || seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      into.push(candidate);
    }
  };

  const nearby: PropertyWithRelations[] = [];
  pick(
    byState.flatMap((result) => result?.data ?? []).filter((home) => normalizeUsState(home.division) === state),
    nearby,
  );
  if (nearby.length < 3) pick(byCity?.data ?? [], nearby);
  return nearby;
}

export async function NearbyHomes({ property }: { property: PropertyWithRelations }) {
  const state = normalizeUsState(property.division);
  const label = state ?? property.division;
  const nearby = await loadNearby(property, state);
  const browsePath = LISTING_PATHS[property.listingType];
  const statePath = state ? `${browsePath}/${stateSlug(state)}` : browsePath;

  return (
    <section aria-labelledby="nearby-heading" className="mx-auto mt-24 max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Keep looking</p>
          <h2 id="nearby-heading" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
            More homes in <SerifAccent>{label}</SerifAccent>
          </h2>
        </div>
        {nearby.length > 0 && (
          <Button asChild variant="outline">
            <Link href={statePath}>
              View all <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>
      {nearby.length > 0 ? (
        <PropertyGrid properties={nearby} />
      ) : (
        <EmptyState
          icon={MapPinned}
          title={`No other homes in ${label} yet`}
          description="New listings arrive every week. Meanwhile, there's more to see across the country."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/properties">Browse all homes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={browsePath}>See homes in nearby states</Link>
              </Button>
            </div>
          }
          className="rounded-3xl border border-border bg-card"
        />
      )}
    </section>
  );
}
