"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroSearch, type HeroCity } from "@/components/home/hero-search";
import { SplitText } from "@/components/motion/split-text";
import { useDarkHero } from "@/hooks/use-dark-hero";
import { useIntroDone } from "@/hooks/use-intro-done";
import { useFinePointer, useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** A real featured listing shown as a floating glass card. */
export type HeroCard = {
  id: string;
  title: string;
  image: string;
  price: string;
  location: string;
};

// Picked from three candidates (see the Step 30 notes); swap freely.
const HERO_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

// Each card sits at its own depth: z for perspective, `depth` for how far it
// follows the mouse, `fly` for where it leaves to as the hero scrolls away.
const CARD_LAYOUT = [
  { position: "top-[12%] right-[5%] w-60", z: 120, depth: 1, fly: { x: 320, y: -180 }, bob: "0s" },
  { position: "top-[21%] right-[26%] w-44", z: -80, depth: 0.45, fly: { x: -260, y: -240 }, bob: "-2s" },
  { position: "top-[41%] right-[10%] w-52", z: 40, depth: 0.75, fly: { x: 340, y: 200 }, bob: "-4s" },
] as const;

/**
 * Cinematic first screen: full-viewport photo, split-line headline, glass
 * search and floating property cards at different depths. Scrolling scales
 * the photo up while the copy lifts away and the
 * cards fly outward (pinned briefly on desktop). Mobile keeps a lighter
 * version; reduced motion shows everything static.
 */
export function Hero({ cities, cards }: { cities: HeroCity[]; cards: HeroCard[] }) {
  useDarkHero();
  const sectionRef = useRef<HTMLElement>(null);
  const motionOk = useMotionOk();
  const isDesktop = useIsDesktop();
  const finePointer = useFinePointer();
  const ready = useIntroDone();

  // Entrance: plays once the intro curtain has lifted (CSS keeps it hidden until then).
  useGSAP(
    () => {
      // Phones skip the entrance (the CSS that hides [data-enter] is md+ only).
      if (!motionOk || !ready || !isDesktop) return;
      gsap.fromTo(
        "[data-enter]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.35 },
      );
    },
    { scope: sectionRef, dependencies: [motionOk, ready, isDesktop] },
  );

  // Scroll: "dolly into the building". Desktop pins for a moment; mobile just scrubs.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!motionOk || !section) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: isDesktop ? "+=70%" : "bottom top",
          scrub: true,
          pin: isDesktop,
        },
      });
      tl.to("[data-hero-media]", { scale: isDesktop ? 1.35 : 1.15 }, 0).to(
        "[data-hero-copy]",
        { y: isDesktop ? -140 : -60, opacity: 0 },
        0,
      );
      if (isDesktop) {
        gsap.utils.toArray<HTMLElement>("[data-hero-fly]").forEach((card, index) => {
          const { x, y } = CARD_LAYOUT[index].fly;
          tl.to(card, { x, y, scale: 1.25, opacity: 0 }, 0);
        });
      }
    },
    { scope: sectionRef, dependencies: [motionOk, isDesktop] },
  );

  // Mouse parallax: nearer cards follow the cursor further (desktop mouse only).
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!motionOk || !finePointer || !isDesktop || !section) return;
      const movers = gsap.utils.toArray<HTMLElement>("[data-hero-parallax]").map((el, index) => ({
        depth: CARD_LAYOUT[index].depth,
        toX: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        toY: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      }));
      const onMove = (event: PointerEvent) => {
        const px = event.clientX / window.innerWidth - 0.5;
        const py = event.clientY / window.innerHeight - 0.5;
        movers.forEach(({ depth, toX, toY }) => {
          toX(px * 60 * depth);
          toY(py * 40 * depth);
        });
      };
      section.addEventListener("pointermove", onMove);
      return () => section.removeEventListener("pointermove", onMove);
    },
    { scope: sectionRef, dependencies: [motionOk, finePointer, isDesktop] },
  );

  return (
    // Owned wrapper so ScrollTrigger's pin spacer stays inside this component.
    <div>
      <section
        ref={sectionRef}
        className="relative h-svh min-h-160 overflow-hidden bg-[#12100e] text-white"
      >
        <div data-hero-media className="absolute inset-0 will-change-transform">
          <Image
            src={HERO_IMAGE}
            alt="Modern two-story home with warm interior lights at dusk"
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/80" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-black/55 via-black/10 to-transparent" />

        {cards.length > 0 && (
          <div className="absolute inset-0 hidden perspective-distant transform-3d xl:block">
            <ul aria-label="Featured homes">
              {cards.map((card, index) => {
                const layout = CARD_LAYOUT[index];
                return (
                  <li
                    key={card.id}
                    className={cn("absolute", layout.position)}
                    style={{ transform: `translateZ(${layout.z}px)` }}
                  >
                    <div data-hero-fly>
                      <div data-hero-parallax data-enter>
                        <div
                          className="motion-safe:animate-[hero-bob_6s_ease-in-out_infinite]"
                          style={{ animationDelay: layout.bob }}
                        >
                          <Link
                            href={`/properties/${card.id}`}
                            className="block rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl transition-colors outline-none hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-gold/60"
                          >
                            <span className="relative block aspect-4/3 overflow-hidden rounded-2xl">
                              <Image src={card.image} alt={card.title} fill sizes="240px" className="object-cover" />
                            </span>
                            <span className="block px-2 pt-2.5 pb-1.5">
                              <span className="block text-base font-medium tracking-tight">{card.price}</span>
                              <span className="block truncate text-sm text-white/70">{card.location}</span>
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pt-28 pb-20 sm:px-6 md:pb-24 lg:px-8 lg:pb-16">
          <div data-hero-copy className="max-w-4xl">
            <p data-enter className="text-xs font-medium tracking-[0.3em] text-white/75 uppercase">
              Rental homes across the United States
            </p>
            <h1 className="mt-5 text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.92] font-medium tracking-tighter">
              <SplitText as="span" trigger="load" ready={ready} text="Live somewhere" className="block" />
              <SplitText
                as="span"
                trigger="load"
                ready={ready}
                delay={0.15}
                text="extraordinary"
                className="block font-serif font-normal tracking-[-0.02em] text-gold"
              />
            </h1>
            {/* Not animated: it's the LCP text on phones, so it paints right away (under the intro curtain). */}
            <p className="mt-6 max-w-lg text-lg text-white/80">
              Rental homes in cities across the US. Request in minutes and pay securely once your
              landlord says yes.
            </p>
            <div data-enter className="mt-8">
              <HeroSearch cities={cities} />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
