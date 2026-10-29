"use client";

import { useSyncExternalStore } from "react";

const EVENT = "rn:intro-done";

/** Called by IntroPreloader when the curtain has lifted (or the intro was skipped). */
export function markIntroDone() {
  document.documentElement.dataset.introDone = "";
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * True once the intro is out of the way, so above-the-fold reveals play in
 * view instead of under the curtain. Pages without the intro never wait:
 * IntroPreloader marks it done immediately when it doesn't play.
 */
export function useIntroDone() {
  return useSyncExternalStore(
    subscribe,
    () => "introDone" in document.documentElement.dataset,
    () => false,
  );
}
