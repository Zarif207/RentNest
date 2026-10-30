"use client";

import { useEffect, useState } from "react";
import { MARK_PATHS } from "@/components/brand/logo";
import { markIntroDone } from "@/hooks/use-intro-done";
import { INTRO_SEEN_KEY } from "./intro-gate";

// Timeline (ms from navigation start), mirrored by the CSS animations below.
// The whole intro runs in CSS from the first frame, so the curtain lifts on
// time even while scripts are still loading on a slow phone (it used to wait
// for hydration, which pushed the hero text's first paint past 4 s).
const LIFT_AT = 1050;
const LIFT_MS = 550;

/**
 * First-visit intro: ink screen, the monogram draws itself, a 0→100 counter
 * runs, then the curtain lifts. Plays once per browser session; skipped (and
 * hidden before paint by IntroGate) for repeat visits and reduced motion.
 */
export function IntroPreloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Repeat visit / reduced motion: the overlay is already hidden by CSS.
    const seen = "introSeen" in document.documentElement.dataset;
    if (!seen) {
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        // Storage blocked: the intro may replay next visit, which is harmless.
      }
    }
    // Hydration may land mid-intro or after it; time from navigation start.
    const elapsed = seen ? Infinity : performance.now();
    const reveal = window.setTimeout(markIntroDone, Math.max(0, LIFT_AT - elapsed));
    const remove = window.setTimeout(() => setDone(true), Math.max(0, LIFT_AT + LIFT_MS - elapsed));
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(remove);
    };
  }, []);

  if (done) return null;

  const { circle, roof, letter } = MARK_PATHS;
  const draw = (index: number) => ({
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    style: { animationDelay: `${index * 120}ms` },
    className: "animate-[intro-draw_800ms_ease-in-out_forwards]",
  });

  return (
    <div
      data-intro
      aria-hidden
      className="fixed inset-0 z-100 grid place-items-center bg-[#12100e] text-[#c2a878] animate-[intro-lift_550ms_cubic-bezier(0.76,0,0.24,1)_1050ms_forwards]"
    >
      <svg
        viewBox="0 0 48 48"
        width={112}
        height={112}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={circle.cx} cy={circle.cy} r={circle.r} strokeWidth={circle.strokeWidth} {...draw(0)} />
        <path d={roof.d} strokeWidth={roof.strokeWidth} {...draw(1)} />
        <path d={letter.d} strokeWidth={letter.strokeWidth} {...draw(2)} />
      </svg>
      {/* 000 → 100 in CSS (an animated integer custom property feeding a counter). */}
      <span className="intro-count absolute right-6 bottom-6 font-mono text-sm tracking-[0.2em] text-[#f2eee7]/70 tabular-nums sm:right-10 sm:bottom-10" />
    </div>
  );
}
