"use client";

import { useRef } from "react";
import Image from "next/image";
import { HeroMosaic, MOSAIC_FACETS, type HeroCard } from "@/components/home/hero-mosaic";
import { HeroSearch, type HeroSuggestion } from "@/components/home/hero-search";
import { SplitText } from "@/components/motion/split-text";
import { useDarkHero } from "@/hooks/use-dark-hero";
import { useIntroDone } from "@/hooks/use-intro-done";
import { useFinePointer, useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";

export type { HeroCard };

// Picked from three candidates (see the Step 30 notes); swap freely.
const HERO_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

/**
 * Cinematic first screen: full-viewport photo, split-line headline, glass
 * search and a tangram-house mosaic of listings. Scrolling scales the photo up
 * while the copy lifts away and the house's pieces fly outward (pinned
 * briefly on desktop). Mobile keeps a lighter version; reduced motion shows
 * everything static.
 */
export function Hero({ suggestions, cards }: { suggestions: HeroSuggestion[]; cards: HeroCard[] }) {
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
      // The pieces drift in from just outside their places and lock together.
      gsap.from("[data-facet-enter]", {
        opacity: 0,
        x: (index: number) => MOSAIC_FACETS[index].direction[0] * 70,
        y: (index: number) => MOSAIC_FACETS[index].direction[1] * 70,
        rotation: (index: number) => MOSAIC_FACETS[index].direction[0] * 8,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.05,
        delay: 0.45,
      });
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
      // The house breaks apart: each piece flies away from the center. Phones
      // get a short, flat version of the same move.
      const reach = isDesktop ? 360 : 90;
      gsap.utils.toArray<HTMLElement>("[data-facet-fly]").forEach((facet, index) => {
        const [dx, dy] = MOSAIC_FACETS[index].direction;
        tl.to(
          facet,
          isDesktop
            ? { x: dx * reach, y: dy * reach, z: 160, rotation: dx * 24, rotationX: dy * -30, opacity: 0 }
            : { x: dx * reach, y: dy * reach, opacity: 0 },
          0,
        );
      });
    },
    { scope: sectionRef, dependencies: [motionOk, isDesktop] },
  );

  // Mouse parallax: the whole house turns toward the cursor, so pieces at
  // different depths shift by different amounts (desktop mouse only).
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!motionOk || !finePointer || !isDesktop || !section) return;
      const toY = gsap.quickTo("[data-mosaic-tilt]", "rotationY", { duration: 0.9, ease: "power3.out" });
      const toX = gsap.quickTo("[data-mosaic-tilt]", "rotationX", { duration: 0.9, ease: "power3.out" });
      const onMove = (event: PointerEvent) => {
        toY((event.clientX / window.innerWidth - 0.5) * 22);
        toX((event.clientY / window.innerHeight - 0.5) * -16);
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
        className="relative min-h-[max(100svh,40rem)] overflow-hidden bg-[#12100e] text-white"
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

        {/* Grows past the viewport on short phones rather than cutting the copy off. */}
        <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-7xl flex-col justify-end px-4 pt-28 pb-20 sm:px-6 md:pb-24 lg:px-8 lg:pb-16">
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
          </div>
          {/* Phones: small, right under the headline. md+: top right, beside the copy. */}
          <HeroMosaic
            cards={cards}
            className="mt-4 w-[min(9rem,40vw)] self-end md:absolute md:top-[max(6.5rem,12svh)] md:right-6 md:mt-0 md:w-[min(26vw,24rem)] md:portrait:w-[min(46vw,26rem)] lg:right-8"
          />
          <div data-hero-copy className="max-w-4xl">
            {/* Not animated: it's the LCP text on phones, so it paints right away (under the intro curtain). */}
            <p className="mt-4 max-w-lg text-lg text-white/80 md:mt-6">
              Rental homes in cities across the US. Request in minutes and pay securely once your
              landlord says yes.
            </p>
            <div data-enter className="mt-8">
              <HeroSearch suggestions={suggestions} />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
