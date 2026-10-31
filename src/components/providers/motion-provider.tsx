"use client";

import { LazyMotion } from "motion/react";

const loadFeatures = () => import("@/lib/motion-features").then((module) => module.default);

/**
 * Lets every `m` component animate once the features chunk arrives. `strict`
 * makes a stray `motion.*` (which would bundle everything) throw in dev.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
