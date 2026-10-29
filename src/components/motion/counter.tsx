"use client";

import { useRef } from "react";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const numberFormat = new Intl.NumberFormat("en-US");

/**
 * Counts up from 0 to `value` the first time it scrolls into view. The final
 * number is server-rendered (and read by screen readers), so nothing is lost
 * without JavaScript or under reduced motion.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const format = (n: number) => `${prefix}${numberFormat.format(Math.round(n))}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [motionOk, value, prefix, suffix] },
  );

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden>
        {format(value)}
      </span>
    </span>
  );
}
