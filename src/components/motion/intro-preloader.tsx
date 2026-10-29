"use client";

import { useRef, useState } from "react";
import { MARK_PATHS } from "@/components/brand/logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { INTRO_SEEN_KEY } from "./intro-gate";

// Hard cap so the intro can never hold the page longer than this.
const MAX_MS = 2200;

/**
 * First-visit intro: ink screen, the monogram draws itself, a 0→100 counter
 * runs, then the curtain lifts. Plays once per browser session; skipped (and
 * hidden before paint by IntroGate) for repeat visits and reduced motion.
 */
export function IntroPreloader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || "introSeen" in document.documentElement.dataset) {
        setDone(true);
        return;
      }
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        // Storage blocked: the intro may replay next visit, which is harmless.
      }

      const finish = () => setDone(true);
      const safety = window.setTimeout(finish, MAX_MS);
      const count = { n: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to("[data-draw]", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: 0.15 }, 0)
        .to(
          count,
          {
            n: 100,
            duration: 1.3,
            ease: "power1.inOut",
            onUpdate: () => {
              if (countRef.current) countRef.current.textContent = String(Math.round(count.n)).padStart(3, "0");
            },
          },
          0,
        )
        .to(root, { yPercent: -100, duration: 0.65, ease: "power4.inOut" }, 1.4);

      return () => window.clearTimeout(safety);
    },
    { scope: rootRef },
  );

  if (done) return null;

  const { circle, roof, letter } = MARK_PATHS;
  const draw = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1, "data-draw": "" };

  return (
    <div
      ref={rootRef}
      data-intro
      aria-hidden
      className="fixed inset-0 z-100 grid place-items-center bg-[#12100e] text-[#c2a878]"
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
        <circle cx={circle.cx} cy={circle.cy} r={circle.r} strokeWidth={circle.strokeWidth} {...draw} />
        <path d={roof.d} strokeWidth={roof.strokeWidth} {...draw} />
        <path d={letter.d} strokeWidth={letter.strokeWidth} {...draw} />
      </svg>
      <span
        ref={countRef}
        className="absolute right-6 bottom-6 font-mono text-sm tracking-[0.2em] text-[#f2eee7]/70 tabular-nums sm:right-10 sm:bottom-10"
      >
        000
      </span>
    </div>
  );
}
