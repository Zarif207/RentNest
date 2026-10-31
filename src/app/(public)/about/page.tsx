import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AboutHero } from "@/components/about/about-hero";
import { ImageReveal } from "@/components/about/image-reveal";
import { SafetyTimeline } from "@/components/about/safety-timeline";
import { Signature } from "@/components/about/signature";
import { ValuesStack } from "@/components/about/values-stack";
import { CtaBanner } from "@/components/home/cta-banner";
import { LiveStats } from "@/components/home/live-stats";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { getPublicProperties, orNull } from "@/lib/data/public";
import { toLiveStats } from "@/lib/live-stats";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why RentNest exists, what it stands for and how it keeps renting and buying safe: Stripe payments, role-based access and moderation.",
};

const STORY_IMAGE = "https://images.unsplash.com/photo-1505691938895-1758d7feb511";

export default async function AboutPage() {
  // The same truthful numbers as the home page.
  const [all, available] = await Promise.all([
    orNull(getPublicProperties({ limit: 100 })),
    orNull(getPublicProperties({ availabilityStatus: "AVAILABLE", limit: 1 })),
  ]);
  const stats = toLiveStats(all, available);

  return (
    <>
      <AboutHero />

      <section aria-labelledby="story-title" className="py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
          <Reveal className="space-y-6">
            <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Our story</p>
            <h2 id="story-title" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
              One place for the <SerifAccent>whole journey</SerifAccent>
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Finding a home to rent or buy usually means jumping between listing sites, chasing owners for
                answers and sending money on trust.
              </p>
              <p>
                RentNest brings it together. Owners list homes to rent or to buy, with photos and real prices.
                Renters request a move-in date and lease length; buyers make offers. Owners answer from their
                dashboard, and money moves through Stripe only after a yes: the rent, or a deposit on an agreed
                price.
              </p>
              <p>
                It began as a full-stack project to show that a home marketplace can be simple and safe at the
                same time, and every number on this site comes straight from its live database.
              </p>
            </div>
          </Reveal>
          <ImageReveal
            src={STORY_IMAGE}
            alt="A living room with a white sofa, blue cushions and abstract art"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-4/5 lg:aspect-5/6"
          />
        </div>
      </section>

      <ValuesStack />

      {stats.length > 0 && (
        <section aria-labelledby="numbers-title" className="pt-24 sm:pt-32">
          <div className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="In numbers"
              title={
                <span id="numbers-title">
                  Live from <SerifAccent>the platform</SerifAccent>
                </span>
              }
              description="Counted from real listings and refreshed every minute, never typed in."
            />
          </div>
          <LiveStats stats={stats} />
        </section>
      )}

      <section aria-labelledby="safety-title" className="bg-surface py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="How we keep it safe"
              title={
                <span id="safety-title">
                  Safeguards, <SerifAccent>not slogans</SerifAccent>
                </span>
              }
              description="What the app and its API actually do to protect tenants, landlords and their money."
            />
          </div>
          <SafetyTimeline />
        </div>
      </section>

      <section aria-labelledby="built-title" className="py-24 sm:py-32">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
   
          <p className="mt-8 text-xs font-medium tracking-[0.25em] text-bronze uppercase">Built by</p>
          <h2 id="built-title" className="mt-3 text-4xl font-medium tracking-tighter sm:text-5xl">
            Zarif Hasan
          </h2>
          <Signature className="mt-4" />
          <p className="mt-5 max-w-2xl font-serif text-2xl leading-snug sm:text-3xl">
            Designed and built to make renting and buying in the US simpler, clearer and safer, for both sides of
            the door.
          </p>
          <Link
            href="https://github.com/Zarif207/RentNest"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            View the project on GitHub <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}
