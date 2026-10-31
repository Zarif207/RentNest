import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStateListings, StateLanding, stateIntro, stateParams } from "@/components/properties/state-landing";
import { orNull } from "@/lib/data/public";
import { stateFromSlug } from "@/lib/us-states";

// Prerendered for the states with listings; other states render on demand.
export async function generateStaticParams() {
  return stateParams("SALE");
}

export async function generateMetadata({ params }: PageProps<"/buy/[state]">): Promise<Metadata> {
  const state = stateFromSlug((await params).state);
  if (!state) return { title: "State not found" };
  const listings = await orNull(loadStateListings("SALE", state));
  return {
    title: `Homes for sale in ${state}`,
    description: stateIntro("SALE", state, listings?.data ?? []),
  };
}

export default async function BuyStatePage({ params }: PageProps<"/buy/[state]">) {
  const state = stateFromSlug((await params).state);
  if (!state) notFound();
  return <StateLanding listingType="SALE" state={state} />;
}
