"use client";

import { useRef } from "react";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Fades and slides content up the first time it scrolls into view. With
 * `stagger`, each direct child animates in turn (card grids, lists).
 */
export function Reveal({
  children,
  stagger = false,
  delay = 0,
  y = 32,
  className,
}: {
  children: React.ReactNode;
  stagger?: boolean;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      gsap.from(stagger ? el.children : el, {
        y,
        opacity: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [motionOk, stagger, delay, y] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
