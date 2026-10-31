"use client";

import { useShallow } from "zustand/react/shallow";
import type { ConsentCategory } from "@/lib/consent";
import { useConsentStore } from "@/store/consent-store";

/**
 * The visitor's cookie choice. Load any analytics or marketing script only
 * when `allows("analytics")` / `allows("marketing")` is true, e.g.
 * `{allows("analytics") && <Script src="…" />}`.
 */
export function useConsent() {
  const { consent, loaded, setSettingsOpen } = useConsentStore(
    useShallow(({ consent, loaded, setSettingsOpen }) => ({ consent, loaded, setSettingsOpen })),
  );
  return {
    consent,
    /** A choice has been saved (the banner won't show again). */
    decided: consent !== null,
    loaded,
    allows: (category: ConsentCategory) => consent?.[category] === true,
    openSettings: () => setSettingsOpen(true),
  };
}
