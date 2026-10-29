"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Live result of a CSS media query (`serverValue` during SSR and hydration). */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}

/** md breakpoint and up: where 3D, pinning and parallax run at full strength. */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)");
}

/** A mouse or trackpad (not touch), for hover-driven effects like tilt and magnetic. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * False under prefers-reduced-motion, and on the server, so content always
 * renders plain first and animation is an enhancement.
 */
export function useMotionOk() {
  return useMediaQuery("(prefers-reduced-motion: no-preference)");
}
