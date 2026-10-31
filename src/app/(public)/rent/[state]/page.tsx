import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStateListings, StateLanding, stateIntro, stateParams } from "@/components/properties/state-landing";
import { orNull } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { stateFromSlug, stateSlug } from "@/lib/us-states";

// Prerendered for the states with listings; other states render on demand.
export async function generateStaticParams() {
  return stateParams("RENT");
}

export async function generateMetadata({ params }: PageProps<"/rent/[state]">): Promise<Metadata> {
  const state = stateFromSlug((await params).state);
  if (!state) return { title: "State not found" };
  const listings = await orNull(loadStateListings("RENT", state));
  return pageMetadata({
    title: `Homes for rent in ${state}`,
    description: stateIntro("RENT", state, listings?.data ?? []),
    path: `/rent/${stateSlug(state)}`,
  });
}

export default async function RentStatePage({ params }: PageProps<"/rent/[state]">) {
  const state = stateFromSlug((await params).state);
  if (!state) notFound();
  return <StateLanding listingType="RENT" state={state} />;
}
