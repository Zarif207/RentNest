"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// The live instance, so other components can scroll through Lenis.
let activeLenis: Lenis | null = null;

/** Smoothly scroll to `top` (Lenis when running, the browser otherwise). */
export function smoothScrollTo(top: number) {
  if (activeLenis) activeLenis.scrollTo(top, { duration: 1.4 });
  else window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/** Stop Lenis while an overlay (like the mobile menu) locks the page. */
export function setSmoothScrollPaused(paused: boolean) {
  if (paused) activeLenis?.stop();
  else activeLenis?.start();
}

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
    activeLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      activeLenis = null;
    };
  }, [motionOk]);

  return children;
}
