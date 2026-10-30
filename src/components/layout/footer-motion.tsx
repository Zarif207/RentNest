"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { smoothScrollTo } from "@/components/motion/smooth-scroll-provider";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The oversized outlined "RENTNEST" across the footer. SVG `textLength`
 * makes it span the full width at any size; it rises into place as the
 * footer scrolls in and fills with champagne on hover.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      gsap.fromTo(
        el.firstElementChild,
        { yPercent: 45 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [motionOk] },
  );

  return (
    <div ref={ref} aria-hidden className="overflow-hidden">
      <svg viewBox="0 0 1000 160" className="group block w-full will-change-transform">
        <text
          x="0"
          y="140"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          className="fill-transparent stroke-white/25 font-sans text-[190px] font-medium tracking-tighter transition-[fill,stroke] duration-700 ease-out group-hover:fill-gold group-hover:stroke-gold"
          strokeWidth="1"
        >
          RENTNEST
        </text>
      </svg>
    </div>
  );
}

/** Circular "Back to top" button; scrolls through Lenis when it's running. */
export function BackToTop() {
  return (
    <Magnetic strength={0.35}>
      <button
        type="button"
        onClick={() => smoothScrollTo(0)}
        className="group grid size-16 place-items-center rounded-full border border-white/20 text-white transition-colors outline-none hover:border-gold hover:bg-gold hover:text-gold-foreground focus-visible:ring-3 focus-visible:ring-gold/50"
      >
        <ArrowUp className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
        <span className="sr-only">Back to top</span>
      </button>
    </Magnetic>
  );
}
