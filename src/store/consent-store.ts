import { create } from "zustand";
import { readConsent, writeConsent, type Consent, type ConsentCategory } from "@/lib/consent";

type ConsentState = {
  consent: Consent | null;
  /** False until the cookie has been read in the browser. */
  loaded: boolean;
  /** The "Customize" / "Cookie settings" dialog. */
  settingsOpen: boolean;
  load: () => void;
  save: (choice: Record<ConsentCategory, boolean>) => void;
  setSettingsOpen: (open: boolean) => void;
};

export const useConsentStore = create<ConsentState>()((set, get) => ({
  consent: null,
  loaded: false,
  settingsOpen: false,

  load: () => {
    if (get().loaded) return;
    set({ consent: readConsent(), loaded: true });
  },

  save: (choice) => set({ consent: writeConsent(choice), settingsOpen: false }),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
