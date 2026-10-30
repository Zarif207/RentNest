"use client";

import { useRef } from "react";
import { Ban, CreditCard, KeyRound, UserCheck, type LucideIcon } from "lucide-react";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";

type Safeguard = { title: string; text: string; icon: LucideIcon };

// Each line describes what the app and API actually do.
const SAFEGUARDS: Safeguard[] = [
  {
    title: "Secure Stripe payments",
    text: "Tenants pay on Stripe's hosted checkout, and only after the landlord approves. RentNest never handles card numbers.",
    icon: CreditCard,
  },
  {
    title: "Role-based access",
    text: "Tenant, landlord and admin dashboards are separate. The site checks your role before showing a page, and the API checks it again on every request.",
    icon: KeyRound,
  },
  {
    title: "Real landlord accounts",
    text: "Every listing belongs to a registered landlord account, and its contact details are shown on the listing.",
    icon: UserCheck,
  },
  {
    title: "Moderation",
    text: "Admins can see every user, listing and rental, and block accounts that break the rules. Blocked accounts can't sign in.",
    icon: Ban,
  },
];

/** "How we keep it safe": a vertical timeline whose gold line fills as you scroll. */
export function SafetyTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const motionOk = useMotionOk();

  useGSAP(
    () => {
      const list = ref.current;
      if (!motionOk || !list) return;
      gsap.fromTo(
        "[data-line-fill]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]", list).forEach((step) => {
        gsap.from(step, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 80%", once: true },
        });
      });
    },
    { scope: ref, dependencies: [motionOk] },
  );

  return (
    <ol ref={ref} className="relative space-y-12">
      <span aria-hidden className="absolute top-2 bottom-2 left-6 w-px bg-border" />
      <span aria-hidden data-line-fill className="absolute top-2 bottom-2 left-6 w-px origin-top bg-gold" />
      {SAFEGUARDS.map(({ title, text, icon: Icon }, index) => (
        <li key={title} data-step className="relative grid grid-cols-[3rem_1fr] gap-6">
          <span className="relative z-10 grid size-12 place-items-center rounded-full border border-gold/40 bg-background text-bronze">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="pt-1.5">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Safeguard {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-2xl font-medium tracking-tight">{title}</h3>
            <p className="mt-2 max-w-xl text-muted-foreground">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
