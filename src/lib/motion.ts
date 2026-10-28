import { stagger, type Variants } from "motion/react";

// Shared motion presets: 0.3–0.6s, ease-out (see CLAUDE.md "Motion").

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function staggerContainer(interval = 0.08): Variants {
  return {
    hidden: {},
    visible: { transition: { delayChildren: stagger(interval) } },
  };
}
