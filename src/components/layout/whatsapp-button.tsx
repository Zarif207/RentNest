"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const DEFAULT_MESSAGE = "Hi RentNest, I have a question.";
const GREETING_KEY = "rn_whatsapp_greeting_dismissed";
const GREETING_DELAY_MS = 4000;
const DETAILS_PATH = /^\/properties\/[0-9a-f-]{36}$/i;

function WhatsAppIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** On a listing, mention it by name and link; anywhere else, a general question. */
function currentMessage(pathname: string) {
  if (!DETAILS_PATH.test(pathname)) return DEFAULT_MESSAGE;
  // The details page's <title> is "<property title> · RentNest".
  const title = document.title.split(" · ")[0]?.trim();
  return title ? `Hi RentNest, I'm interested in ${title} (${window.location.href})` : DEFAULT_MESSAGE;
}

function readDismissed() {
  try {
    return localStorage.getItem(GREETING_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Floating WhatsApp chat button (public pages only). A soft ring pulses every
 * few seconds; a small greeting appears once, 4 s after load, until dismissed.
 * It steps aside while the footer's "Back to top" button is on screen.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [greeting, setGreeting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (readDismissed()) return;
    const timer = window.setTimeout(() => setGreeting(true), GREETING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Get out of the way of the footer's back-to-top button (re-found per page).
  useEffect(() => {
    const target = document.querySelector("[data-back-to-top]");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(Boolean(entry?.isIntersecting)), {
      rootMargin: "0px 0px 40px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  const number = WHATSAPP_NUMBER;

  const dismissGreeting = () => {
    setGreeting(false);
    try {
      localStorage.setItem(GREETING_KEY, "1");
    } catch {
      // Private mode: it just shows again next visit.
    }
  };

  return (
    <div
      className={cn(
        "fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex items-end gap-3 transition-[opacity,translate] duration-300",
        hidden && "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      {greeting && (
        <div
          role="status"
          className="relative mb-2 flex items-center gap-2 rounded-2xl rounded-br-sm border border-border bg-popover py-2.5 pr-2 pl-4 text-sm text-popover-foreground shadow-xl shadow-black/10 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        >
          <span className="whitespace-nowrap">Questions? Chat with us</span>
          <button
            type="button"
            onClick={dismissGreeting}
            aria-label="Dismiss"
            className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      )}

      <a
        href={whatsappLink(number, DEFAULT_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with RentNest on WhatsApp"
        // Build the message at click time, from the page you're on now.
        onClick={(event) => {
          event.currentTarget.href = whatsappLink(number, currentMessage(pathname));
          if (greeting) dismissGreeting();
        }}
        className="relative grid size-14 shrink-0 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25d366]/40 active:scale-95 motion-reduce:hover:scale-100"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#25d366] motion-safe:animate-[wa-pulse_4s_ease-out_infinite] motion-reduce:hidden"
        />
        <WhatsAppIcon className="relative size-7" />
      </a>
    </div>
  );
}
