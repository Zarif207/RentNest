"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useFinePointer, useMotionOk } from "@/hooks/use-motion";

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
 * stay in sync. Mounted only on the public site (not dashboards). Touch
 * screens and prefers-reduced-motion keep native scrolling and never
 * download Lenis; elsewhere it (and GSAP) load after hydration.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const motionOk = useMotionOk();
  const finePointer = useFinePointer();

  useEffect(() => {
    if (!motionOk || !finePointer) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void Promise.all([import("lenis"), import("@/lib/gsap")]).then(([{ default: LenisClass }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const lenis = new LenisClass({ lerp: 0.1 });
      activeLenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        activeLenis = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [motionOk, finePointer]);

  return children;
}
