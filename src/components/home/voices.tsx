"use client";

import { useState } from "react";
import Link from "next/link";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, MessageSquareQuote } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StarRating } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

/** A real review left by a tenant with an active or completed rental. */
export type Voice = {
  id: string;
  quote: string;
  name: string;
  property: string;
  propertyId: string;
  rating: number;
};

export type VoicesSummary = {
  count: number;
  average: number | null;
  cities: number;
  states: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

/** Fewer than three real reviews: say so plainly instead of inventing quotes. */
function NoVoicesYet({ summary }: { summary: VoicesSummary }) {
  const facts = [
    {
      value: summary.average === null ? "—" : summary.average.toFixed(1),
      label: summary.count === 0 ? "No ratings yet" : `Average of ${summary.count} ${summary.count === 1 ? "review" : "reviews"}`,
    },
    { value: String(summary.cities), label: summary.cities === 1 ? "City listed" : "Cities listed" },
    { value: String(summary.states), label: summary.states === 1 ? "State" : "States" },
  ];
  return (
    <Reveal className="grid gap-10 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
      <div>
        <span className="grid size-12 place-items-center rounded-full bg-gold/15 text-bronze">
          <MessageSquareQuote className="size-5" aria-hidden />
        </span>
        <p className="mt-6 font-serif text-3xl leading-tight sm:text-4xl">
          Built for renters and landlords across the US.
        </p>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Only tenants who have rented a home through RentNest can review it, so there&apos;s nothing to quote
          here yet. As leases begin, their words will appear on this page, unedited.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/properties">
            Find your first home <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
        {facts.map((fact) => (
          <div key={fact.label} className="border-t border-border pt-4">
            <dt className="text-sm text-muted-foreground">{fact.label}</dt>
            <dd className="mt-1 text-4xl font-medium tracking-tighter tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/** Large upright-serif quote carousel of real reviews, with a "01 / 0N" counter. */
export function Voices({ items, summary }: { items: Voice[]; summary: VoicesSummary }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  if (items.length < 3) return <NoVoicesYet summary={summary} />;

  const current = items[index];
  const go = (step: 1 | -1) => setIndex((value) => (value + step + items.length) % items.length);

  return (
    <Reveal className="rounded-3xl border border-border bg-card p-6 sm:p-12">
      <div aria-live="polite" className="min-h-72 sm:min-h-64">
        <AnimatePresence mode="wait" initial={false}>
          <m.figure
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <StarRating rating={current.rating} className="text-xl" />
            <blockquote className="mt-6 font-serif text-3xl leading-[1.15] sm:text-4xl lg:text-5xl">
              “{current.quote}”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <UserAvatar name={current.name} className="size-11" />
              <div>
                <p className="font-medium">{current.name}</p>
                <Link
                  href={`/properties/${current.propertyId}`}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {current.property}
                </Link>
              </div>
            </figcaption>
          </m.figure>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm font-medium tabular-nums">
          {pad(index + 1)}
          <span className="text-muted-foreground"> / {pad(items.length)}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Previous review" onClick={() => go(-1)}>
            <ArrowLeft />
          </Button>
          <Button size="icon" aria-label="Next review" onClick={() => go(1)}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
