"use client";

import { useRef } from "react";
import { useFinePointer, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Wraps a button or link so it drifts slightly toward the cursor and springs
 * back on leave. Mouse/trackpad only; inert on touch and reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const finePointer = useFinePointer();

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !finePointer || !el) return;
      const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        toX((event.clientX - rect.left - rect.width / 2) * strength);
        toY((event.clientY - rect.top - rect.height / 2) * strength);
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref, dependencies: [motionOk, finePointer, strength] },
  );

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {children}
    </span>
  );
}
