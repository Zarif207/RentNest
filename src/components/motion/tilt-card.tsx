"use client";

import { useRef } from "react";
import { useFinePointer, useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Tilts toward the cursor in 3D (perspective + rotateX/Y) with a soft glare
 * that follows the pointer. Desktop mouse only; flat everywhere else.
 */
export function TiltCard({
  children,
  max = 8,
  className,
}: {
  children: React.ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const finePointer = useFinePointer();
  const isDesktop = useIsDesktop();
  const enabled = motionOk && finePointer && isDesktop;

  useGSAP(
    () => {
      const el = ref.current;
      const glare = glareRef.current;
      if (!enabled || !el || !glare) return;
      const toRotateX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
      const toRotateY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        toRotateY((px - 0.5) * 2 * max);
        toRotateX((0.5 - py) * 2 * max);
        gsap.set(glare, {
          opacity: 1,
          background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / 0.22), transparent 55%)`,
        });
      };
      const onLeave = () => {
        toRotateX(0);
        toRotateY(0);
        gsap.to(glare, { opacity: 0, duration: 0.4 });
      };

      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref, dependencies: [enabled, max] },
  );

  return (
    <div ref={ref} className={cn("relative transform-3d", className)}>
      {children}
      <span
        ref={glareRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light"
      />
    </div>
  );
}
