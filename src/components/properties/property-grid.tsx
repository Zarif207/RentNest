"use client";

import { motion, useReducedMotion } from "motion/react";
import { PropertyCard } from "@/components/properties/property-card";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { Property } from "@/types";

const container = staggerContainer();

export function PropertyGrid({
  properties,
  eagerCount = 0,
}: {
  properties: Property[];
  /** How many leading cards load their photo eagerly (the first visible row). */
  eagerCount?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3"
      variants={container}
      // Reduced motion: render in place, no fade or stagger.
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {properties.map((property, index) => (
        <motion.li key={property.id} variants={fadeUp}>
          <PropertyCard property={property} eager={index < eagerCount} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
