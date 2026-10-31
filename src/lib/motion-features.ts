// motion/react's animation features (domMax: layoutId needs it), in their own
// chunk. MotionProvider loads it after hydration, so the `m` components cost
// only a few KB up front.
export { domMax as default } from "motion/react";
