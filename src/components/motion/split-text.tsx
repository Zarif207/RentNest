"use client";

import { useRef } from "react";
import { useMotionOk } from "@/hooks/use-motion";
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
  delay = 0,
  className,
}: {
  text: string;
  as?: Tag;
  /** "load" plays immediately (heroes); "scroll" waits until it's in view. */
  trigger?: "load" | "scroll";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      gsap.from(el.querySelectorAll("[data-word]"), {
        yPercent: 110,
        duration: 0.9,
        delay,
        ease: "power4.out",
        stagger: 0.06,
        scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined,
      });
    },
    { scope: ref, dependencies: [motionOk, trigger, delay, text] },
  );

  return (
    <Comp className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
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
