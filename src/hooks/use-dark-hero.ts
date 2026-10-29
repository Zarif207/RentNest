"use client";

import { useEffect, useSyncExternalStore } from "react";

// How many mounted heroes sit under the header with a dark, full-bleed image.
// The header reads it to switch to light text until the page is scrolled.
let darkHeroes = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Call from a dark full-bleed hero so the header turns light over it. */
export function useDarkHero() {
  useEffect(() => {
    darkHeroes += 1;
    notify();
    return () => {
      darkHeroes -= 1;
      notify();
    };
  }, []);
}

/** True while a dark hero is mounted under the header. */
export function useIsOverDarkHero() {
  return useSyncExternalStore(
    subscribe,
    () => darkHeroes > 0,
    () => false,
  );
}
