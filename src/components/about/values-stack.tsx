"use client";

import { useRef } from "react";
import { Eye, ListChecks, ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SerifAccent } from "@/components/shared/serif-accent";
import { useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Value = { title: string; text: string; icon: LucideIcon };

const VALUES: Value[] = [
  {
    title: "Honesty over hype",
    text: "Real listings, real monthly prices, and reviews only from tenants who actually rented the home. Every number on this site comes from the live database.",
    icon: Eye,
  },
  {
    title: "Clarity at every step",
    text: "A request always has a status you can see: pending, approved, active or completed. Nobody has to guess what happens next.",
    icon: ListChecks,
  },
  {
    title: "Safety by default",
    text: "Payments run on Stripe, each dashboard is locked to its role, and accounts that break the rules can be blocked.",
    icon: ShieldCheck,
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function ValueCard({ value, index, dark }: { value: Value; index: number; dark: boolean }) {
  const Icon = value.icon;
  return (
    <article
      className={cn(
        "flex min-h-80 flex-col justify-between gap-10 rounded-3xl border p-8 shadow-2xl shadow-black/10 sm:p-10",
        dark ? "border-white/10 bg-[#12100e] text-white" : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("grid size-12 place-items-center rounded-full", dark ? "bg-gold text-gold-foreground" : "bg-gold/15 text-bronze")}>
          <Icon className="size-5" aria-hidden />
        </span>
        <span className={cn("font-serif text-5xl lining-nums", dark ? "text-gold" : "text-bronze")}>{pad(index + 1)}</span>
      </div>
      <div>
        <h3 className="text-3xl font-medium tracking-tighter sm:text-4xl">{value.title}</h3>
        <p className={cn("mt-3 max-w-lg text-lg", dark ? "text-white/70" : "text-muted-foreground")}>{value.text}</p>
      </div>
    </article>
  );
}

/**
 * "What we believe": on desktop the section pins and each value flips in
 * on the X axis onto the stack while the ones beneath step back. Small
 * screens and reduced motion get the cards in a column.
 */
export function ValuesStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const motionOk = useMotionOk();
  const isDesktop = useIsDesktop();
  const pinned = motionOk && isDesktop;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!pinned || !section) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-value-card]", section);
      gsap.set(cards.slice(1), { rotationX: -95, yPercent: 40, opacity: 0, transformOrigin: "50% 100%" });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: section, start: "top top", end: `+=${cards.length * 70}%`, pin: true, scrub: 0.8 },
      });
      cards.slice(1).forEach((card, i) => {
        tl.to(cards.slice(0, i + 1), { scale: (j: number) => 0.9 + (j / (i + 1)) * 0.05, y: (j: number) => -(i + 1 - j) * 28, duration: 1 }, i)
          .to(card, { rotationX: 0, yPercent: 0, opacity: 1, duration: 1 }, i);
      });
      tl.to({}, { duration: 0.4 });
    },
    { scope: sectionRef, dependencies: [pinned] },
  );

  const heading = (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">What we believe</p>
      <h2 className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
        Three things we <SerifAccent>won&apos;t bend on</SerifAccent>
      </h2>
    </div>
  );

  if (!pinned) {
    return (
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          {heading}
          <Reveal stagger className="grid gap-4 lg:grid-cols-3">
            {VALUES.map((value, index) => (
              <ValueCard key={value.title} value={value} index={index} dark={index === 0} />
            ))}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    // Owned wrapper so the pin spacer stays inside this component.
    <div>
      <section ref={sectionRef} className="flex h-svh items-center overflow-hidden bg-surface pt-16">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_minmax(0,34rem)] items-center gap-16 px-8">
          {heading}
          <div className="relative h-96 perspective-[1600px]">
            {VALUES.map((value, index) => (
              <div key={value.title} data-value-card className="absolute inset-x-0 bottom-0 will-change-transform">
                <ValueCard value={value} index={index} dark={index === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
