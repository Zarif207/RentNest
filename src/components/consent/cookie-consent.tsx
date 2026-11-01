"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Consent, ConsentCategory } from "@/lib/consent";
import { useConsentStore } from "@/store/consent-store";

const CATEGORIES: { id: "essential" | ConsentCategory; label: string; description: string }[] = [
  { id: "essential", label: "Essential", description: "Keep you signed in and remember this choice. Always on." },
  { id: "analytics", label: "Analytics", description: "Show us, anonymously, which pages help people find a home." },
  { id: "marketing", label: "Marketing", description: "Measure campaigns and show RentNest offers that fit you." },
];

const ALL = { analytics: true, marketing: true };
const NONE = { analytics: false, marketing: false };

function useSaveChoice() {
  const save = useConsentStore((state) => state.save);
  return (choice: Record<ConsentCategory, boolean>) => {
    save(choice);
    toast.success("Cookie preferences saved");
  };
}

/** Switches for each category; starts from the saved choice (or all off). */
function SettingsForm({ initial }: { initial: Consent | null }) {
  const saveChoice = useSaveChoice();
  const [choice, setChoice] = useState({
    analytics: initial?.analytics ?? false,
    marketing: initial?.marketing ?? false,
  });

  return (
    <>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {CATEGORIES.map(({ id, label, description }) => {
          const essential = id === "essential";
          return (
            <li key={id} className="flex items-center justify-between gap-4 p-4">
              <label htmlFor={`consent-${id}`} className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">{description}</span>
              </label>
              <Switch
                id={`consent-${id}`}
                checked={essential ? true : choice[id]}
                disabled={essential}
                onCheckedChange={(checked) => !essential && setChoice((value) => ({ ...value, [id]: checked }))}
              />
            </li>
          );
        })}
      </ul>
      <DialogFooter className="gap-2 sm:justify-between">
        <Button variant="outline" onClick={() => saveChoice(ALL)}>
          Accept all
        </Button>
        <Button onClick={() => saveChoice(choice)}>Save choices</Button>
      </DialogFooter>
    </>
  );
}

/**
 * First-visit cookie banner (glass card bottom left on desktop, bottom sheet
 * on phones; it slides up as the intro curtain lifts) plus the settings dialog that "Customize" and the footer's
 * "Cookie settings" open. Once a choice is saved in `rn_consent` the banner
 * never shows again.
 */
export function CookieConsent() {
  const { consent, loaded, settingsOpen, load, setSettingsOpen } = useConsentStore();
  const saveChoice = useSaveChoice();

  useEffect(load, [load]);

  // Rendered on the server and before the cookie is read, so it paints with
  // the page; a saved choice hides it before paint (CONSENT_GATE_SCRIPT) and
  // removes it here once the cookie has been read.
  const showBanner = !(loaded && consent) && !settingsOpen;
  const bannerRef = useRef<HTMLElement>(null);

  // Phones: the banner is a bottom sheet, so the page gets that much extra
  // room at the end and its last content (the footer) can scroll above it.
  useEffect(() => {
    const banner = bannerRef.current;
    if (!showBanner || !banner) return;
    const root = document.documentElement;
    const sheet = window.matchMedia("(max-width: 767px)");
    const update = () => root.style.setProperty("--cookie-banner-space", sheet.matches ? `${banner.offsetHeight}px` : "0px");
    const observer = new ResizeObserver(update);
    observer.observe(banner);
    sheet.addEventListener("change", update);
    return () => {
      observer.disconnect();
      sheet.removeEventListener("change", update);
      root.style.removeProperty("--cookie-banner-space");
    };
  }, [showBanner]);

  return (
    <>
      {showBanner && (
        <section
          ref={bannerRef}
          aria-label="Cookie consent"
          data-cookie-banner
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-card/95 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/20 backdrop-blur-xl md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-3xl md:border md:bg-card/85 md:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-bronze">
              <Cookie className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-medium">Cookies on RentNest</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We use essential cookies to keep you signed in. With your permission we&apos;d also use analytics
                cookies to improve RentNest.{" "}
                <Link href="/cookies" className="text-foreground underline underline-offset-4">
                  Read the cookie policy
                </Link>
              </p>
            </div>
          </div>
          {/* Accept and reject share one style and size, so neither is nudged. */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => saveChoice(NONE)}>
              Reject non-essential
            </Button>
            <Button variant="outline" onClick={() => saveChoice(ALL)}>
              Accept all
            </Button>
          </div>
          <Button variant="link" size="sm" className="mt-2 w-full" onClick={() => setSettingsOpen(true)}>
            Customize
          </Button>
        </section>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie settings</DialogTitle>
            <DialogDescription>
              Choose which optional cookies RentNest may use. You can change this any time from the footer.
            </DialogDescription>
          </DialogHeader>
          {/* Re-mounted on open, so the switches start from the saved choice. */}
          {settingsOpen && <SettingsForm initial={consent} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Footer link that reopens the settings dialog. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const setSettingsOpen = useConsentStore((state) => state.setSettingsOpen);
  return (
    <button type="button" onClick={() => setSettingsOpen(true)} className={className}>
      Cookie settings
    </button>
  );
}
