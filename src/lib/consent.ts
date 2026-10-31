import Cookies from "js-cookie";

export const CONSENT_COOKIE = "rn_consent";

// Runs before first paint (root layout, beforeInteractive): marks <html> when
// a choice is already saved, so CSS hides the server-rendered banner at once.
export const CONSENT_GATE_SCRIPT = `try{if(/(?:^|; )${CONSENT_COOKIE}=/.test(document.cookie))document.documentElement.dataset.consent=""}catch(e){}`;
const SIX_MONTHS_DAYS = 182;

/** Optional cookie categories; essential ones (sign-in) are always on. */
export type ConsentCategory = "analytics" | "marketing";

/** What's saved in the `rn_consent` cookie. */
export type Consent = Record<ConsentCategory, boolean> & {
  /** When the choice was made (ISO). */
  date: string;
};

/** The saved choice, or null if there isn't a valid one yet. */
export function readConsent(): Consent | null {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      "analytics" in value &&
      "marketing" in value &&
      typeof value.analytics === "boolean" &&
      typeof value.marketing === "boolean"
    ) {
      const date = "date" in value && typeof value.date === "string" ? value.date : new Date().toISOString();
      return { analytics: value.analytics, marketing: value.marketing, date };
    }
  } catch {
    // A malformed cookie counts as no choice: ask again.
  }
  return null;
}

/** Saves the choice for six months and returns it. */
export function writeConsent(choice: Record<ConsentCategory, boolean>): Consent {
  const consent: Consent = { ...choice, date: new Date().toISOString() };
  Cookies.set(CONSENT_COOKIE, JSON.stringify(consent), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: SIX_MONTHS_DAYS,
  });
  return consent;
}
