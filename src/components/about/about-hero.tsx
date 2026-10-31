"use client";

import Image from "next/image";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { useIntroDone } from "@/hooks/use-intro-done";

const ABOUT_HERO_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

/** Dark full-bleed opener: a slow parallax photo under a big statement. */
export function AboutHero() {
  const ready = useIntroDone();

  return (
    <section className="relative isolate flex h-[88svh] min-h-152 items-end overflow-hidden bg-[#12100e] text-white">
      <Parallax speed={0.3} className="absolute -inset-y-28 inset-x-0 -z-10">
        <Image
          src={ABOUT_HERO_IMAGE}
          alt="Modern home with a lit interior at dusk"
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/40 to-black/50" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <p className="text-xs font-medium tracking-[0.3em] text-white/70 uppercase">About RentNest</p>
        <h1 className="mt-6 max-w-6xl text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] font-medium tracking-tighter">
          <SplitText as="span" trigger="load" ready={ready} text="Renting should feel like" className="block" />
          <SplitText
            as="span"
            trigger="load"
            ready={ready}
            delay={0.15}
            text="coming home"
            className="block font-serif font-normal tracking-[-0.02em] text-gold"
          />
        </h1>
        <p className="mt-8 max-w-xl text-lg text-white/75">
          RentNest puts the whole rental journey in one place, from the first search to the day you get the keys.
        </p>
      </div>
    </section>
  );
}
