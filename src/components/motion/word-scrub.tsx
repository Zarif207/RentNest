"use client";

import { useRef } from "react";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * A statement paragraph whose words go from 50% to 100% opacity as it scrolls
 * through the viewport (scrubbed, so scrolling back fades them again).
 */
export function WordScrub({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const motionOk = useMotionOk();
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        // 50% keeps unread words at 3:1 contrast (large text) before they light up.
        { opacity: 0.5 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [motionOk, text] },
  );

  return (
    <p ref={ref} className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={index} data-word>
            {word}{" "}
          </span>
        ))}
      </span>
    </p>
  );
}
