"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** Large hero photo with a slow settle-in (1.08 → 1). */
export function HeroImage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-full overflow-hidden rounded-3xl">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
          alt="Modern two-story home with a lit pool at dusk"
          fill
          preload
          fetchPriority="high"
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}
