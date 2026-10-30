"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { MOCKS, type MockKey, type MockListing } from "@/components/home/how-it-works-mocks";
import { Reveal } from "@/components/motion/reveal";
import { SerifAccent } from "@/components/shared/serif-accent";
import { useMediaQuery, useMotionOk } from "@/hooks/use-motion";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Step = { title: string; text: string; mock: MockKey };

const STORIES = {
  tenants: {
    label: "For tenants",
    steps: [
      { title: "Browse", text: "Search verified US listings by city, type and monthly price.", mock: "browse" },
      { title: "Request", text: "Pick a move-in date and lease length. The landlord sees it right away.", mock: "request" },
      { title: "Get approved", text: "Follow your request from pending to approved in your dashboard.", mock: "approved" },
      { title: "Pay securely", text: "Pay the lease through Stripe Checkout. Your card never touches our servers.", mock: "pay" },
      { title: "Move in", text: "Your rental turns active. Settle in, then leave an honest review.", mock: "moveIn" },
    ],
  },
  landlords: {
    label: "For landlords",
    steps: [
      { title: "List", text: "Add photos, rent, amenities and location in a few minutes.", mock: "list" },
      { title: "Review requests", text: "See every request with its move-in date and lease length.", mock: "requests" },
      { title: "Approve", text: "Approve the right tenant with one click and decline the rest.", mock: "approve" },
      { title: "Get paid", text: "Tenants pay through Stripe and the rental goes active. Track it all in one place.", mock: "paid" },
    ],
  },
} satisfies Record<string, { label: string; steps: Step[] }>;

type Audience = keyof typeof STORIES;

const pad = (n: number) => String(n).padStart(2, "0");

function MockCard({
  step,
  index,
  listing,
  className,
}: {
  step: Step;
  index: number;
  listing: MockListing;
  className?: string;
}) {
  const Mock = MOCKS[step.mock];
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-black/10 sm:p-6 dark:shadow-black/40", className)}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <span className="text-lg font-medium tracking-tight">{step.title}</span>
        <span className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Step {pad(index + 1)}</span>
      </div>
      {/* Decorative: the step list carries the meaning, so the mock is inert. */}
      <div inert aria-hidden>
        <Mock listing={listing} />
      </div>
    </div>
  );
}

/**
 * How it works. On large screens the section is tall and its content sticks:
 * scrolling through it advances a 3D card stack (the front card tips back
 * and falls away, the next rises from behind) and highlights the matching
 * step. A toggle swaps the tenant and landlord stories. Small screens and
 * reduced motion get the steps stacked, each with its card.
 */
export function HowItWorks({ listing }: { listing: MockListing }) {
  const [audience, setAudience] = useState<Audience>("tenants");
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();
  const isLarge = useMediaQuery("(min-width: 1024px)");
  const sticky = motionOk && isLarge;
  const steps: Step[] = STORIES[audience].steps;

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!sticky || !track) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", track);
      const last = cards.length - 1;

      // `p` runs 0..last. Each step rests for most of its stretch and only
      // the middle 40% moves the stack; a card's distance from `p` sets its depth.
      const apply = (progress: number) => {
        const raw = progress * last;
        const base = Math.min(Math.floor(raw), last);
        const p = base + gsap.parseEase("power2.inOut")(gsap.utils.clamp(0, 1, (raw - base - 0.3) / 0.4));
        cards.forEach((card, i) => {
          const d = i - p;
          if (d >= 0) {
            const depth = Math.min(d, 3);
            gsap.set(card, {
              y: -depth * 30,
              z: -depth * 90,
              rotationX: 0,
              opacity: gsap.utils.clamp(0, 1, 3 - d),
            });
          } else {
            const t = Math.min(-d, 1);
            // Stays solid while it lifts clear, then fades (no ghosted overlap).
            gsap.set(card, {
              y: -t * 480,
              z: t * 80,
              rotationX: t * 35,
              opacity: gsap.utils.clamp(0, 1, (1 - t) / 0.45),
            });
          }
        });
        setActive(Math.round(p));
      };

      gsap.set(cards, { transformOrigin: "50% 100%" });
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => apply(self.progress),
      });
      apply(trigger.progress);
      // The track's height depends on the story; re-measure everything below.
      ScrollTrigger.refresh();
    },
    { scope: trackRef, dependencies: [sticky, audience], revertOnUpdate: true },
  );

  const toggle = (
    <div role="group" aria-label="Choose a story" className="inline-flex rounded-full border border-border bg-background p-1">
      {(Object.keys(STORIES) as Audience[]).map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={audience === key}
          onClick={() => {
            setAudience(key);
            setActive(0);
          }}
          className="relative rounded-full px-4 py-2 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-5"
        >
          {audience === key && (
            <motion.span
              layoutId="how-it-works-toggle"
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-foreground"
            />
          )}
          <span className={cn("relative transition-colors", audience === key ? "text-background" : "text-muted-foreground")}>
            {STORIES[key].label}
          </span>
        </button>
      ))}
    </div>
  );

  const heading = (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">How it works</p>
      <h2 id="how-it-works-title" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
        From first search <SerifAccent>to the keys</SerifAccent>
      </h2>
    </div>
  );

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="scroll-mt-20 bg-surface">
      {sticky ? (
        <div
          ref={trackRef}
          style={{ height: `${100 + steps.length * 60}svh` }}
          className="relative"
        >
          <div className="sticky top-0 flex h-svh items-center pt-16">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_minmax(0,28rem)] items-center gap-16 px-8 xl:gap-24">
              <div className="space-y-10">
                {heading}
                {toggle}
                <ol className="space-y-1">
                  {steps.map((step, index) => (
                    <li
                      key={`${audience}-${step.title}`}
                      aria-current={index === active ? "step" : undefined}
                      className={cn(
                        "grid grid-cols-[3rem_1fr] gap-x-4 border-l py-3 pl-5 transition-[color,border-color,opacity] duration-500",
                        index === active ? "border-foreground" : "border-border opacity-45",
                      )}
                    >
                      <span className="text-sm font-medium tabular-nums">{pad(index + 1)}</span>
                      <span>
                        <span className="block text-xl font-medium tracking-tight">{step.title}</span>
                        <span
                          className={cn(
                            "grid text-muted-foreground transition-[grid-template-rows,opacity] duration-500",
                            index === active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="block max-w-sm pt-1">{step.text}</span>
                          </span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div aria-hidden className="relative h-128 perspective-[1400px]">
                {steps.map((step, index) => (
                  <div
                    key={`${audience}-${step.mock}`}
                    data-stack-card
                    className="absolute inset-x-0 bottom-0 will-change-transform"
                    style={{ zIndex: steps.length - index }}
                  >
                    <MockCard step={step} index={index} listing={listing} className="h-112" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          {heading}
          {toggle}
          <Reveal key={audience} stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="min-w-0 space-y-4">
                <div className="flex gap-4">
                  <span className="text-sm font-medium tabular-nums">{pad(index + 1)}</span>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight">{step.title}</h3>
                    <p className="mt-1 text-muted-foreground">{step.text}</p>
                  </div>
                </div>
                <div aria-hidden>
                  <MockCard step={step} index={index} listing={listing} />
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      )}
    </section>
  );
}
