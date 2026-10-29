"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger scenes
 * stay in sync. Mounted only on the public site (not dashboards) and skipped
 * under prefers-reduced-motion, where native scrolling is kept.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const motionOk = useMotionOk();

  useEffect(() => {
    if (!motionOk) return;

    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [motionOk]);

  return children;
}
