"use client";

import { useRef } from "react";
import { useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Moves its content vertically at a different rate than the page while it
 * crosses the viewport. `speed` 0.2 = gentle; negative moves the other way.
 * Halved on small screens.
 */
export function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();
  const isDesktop = useIsDesktop();

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      const distance = speed * (isDesktop ? 200 : 100);
      gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [motionOk, isDesktop, speed] },
  );

  return (
    <div ref={ref} className={cn(motionOk && "will-change-transform", className)}>
      {children}
    </div>
  );
}
