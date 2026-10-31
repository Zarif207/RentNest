"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

/** Green circle whose check mark draws itself in. */
export function AnimatedCheck() {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="grid size-20 place-items-center rounded-full bg-[#e2e8dc] text-[#4a5f3c] dark:bg-[#9db48a]/15 dark:text-[#bccfab]"
      initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <svg viewBox="0 0 24 24" className="size-10" fill="none" aria-hidden>
        <m.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        />
      </svg>
    </m.div>
  );
}
