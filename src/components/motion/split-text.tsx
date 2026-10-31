"use client";

import { useRef } from "react";
import { useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

/**
 * Headline reveal without paid plugins: every word sits in an overflow-hidden
 * mask and rises into place, staggered, so lines read as they slide up.
 * Screen readers get the plain text; the animated copy is aria-hidden.
 */
export function SplitText({
  text,
  as: Comp = "h2",
  trigger = "scroll",
  ready = true,
  delay = 0,
  className,
}: {
  text: string;
  as?: Tag;
  /**
   * "load" plays once `ready` (heroes, md+ only; words start hidden in CSS so
   * nothing flashes before hydration); "scroll" waits until it's in view.
   */
  trigger?: "load" | "scroll";
  ready?: boolean;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const isDesktop = useIsDesktop();
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      // Load reveals are desktop-only: on phones the hero text shows at once.
      if (!motionOk || !ready || !el || (trigger === "load" && !isDesktop)) return;
      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        // y: 0 clears the CSS starting offset, which GSAP would read back as pixels.
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 1,
          delay,
          ease: "power4.out",
          stagger: 0.07,
          scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined,
        },
      );
    },
    { scope: ref, dependencies: [motionOk, isDesktop, ready, trigger, delay, text] },
  );

  return (
    <Comp className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden data-split={trigger}>
        {words.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-top">
            <span data-word className="inline-block">
              {word}
              {index < words.length - 1 && " "}
            </span>
          </span>
        ))}
      </span>
    </Comp>
  );
}
