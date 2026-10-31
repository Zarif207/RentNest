"use client";

import { useRef } from "react";
import Image from "@/components/shared/photo";
import { CreditCard, LayoutDashboard, Lock, Moon, ShieldCheck, Sun } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { useFinePointer, useMotionOk } from "@/hooks/use-motion";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const LEASE_MONTHS = 12;

function Tile({
  title,
  text,
  className,
  dark = false,
  children,
}: {
  title: string;
  text: string;
  className?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      data-glow-tile
      className={cn(
        "relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border p-6 sm:p-8",
        // Cursor glow: a soft champagne light at the pointer (--x/--y), shown while the grid is hovered.
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(420px_circle_at_var(--x,50%)_var(--y,50%),color-mix(in_oklab,var(--color-gold)_22%,transparent),transparent_65%)] before:opacity-0 before:transition-opacity before:duration-500 group-hover/bento:before:opacity-100",
        dark ? "border-white/10 bg-[#12100e] text-white" : "border-border bg-card",
        className,
      )}
    >
      <div aria-hidden className="relative">
        {children}
      </div>
      <div className="relative">
        <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h3>
        <p className={cn("mt-2 max-w-sm", dark ? "text-white/70" : "text-muted-foreground")}>{text}</p>
      </div>
    </article>
  );
}

/**
 * Why RentNest: a bento of six tiles of different sizes, each with a small
 * CSS/SVG illustration. A champagne glow follows the cursor across the grid
 * (mouse only); illustrations hold still under reduced motion.
 */
export function WhyRentNest({ rent, photos }: { rent: number; photos: string[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const motionOk = useMotionOk();

  // One listener for the grid, so the light spills across neighbouring tiles.
  const onPointerMove = (event: React.PointerEvent) => {
    if (!finePointer || !motionOk) return;
    gridRef.current?.querySelectorAll<HTMLElement>("[data-glow-tile]").forEach((tile) => {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty("--x", `${event.clientX - rect.left}px`);
      tile.style.setProperty("--y", `${event.clientY - rect.top}px`);
    });
  };

  return (
    <div ref={gridRef} onPointerMove={onPointerMove} className="group/bento">
      <Reveal stagger className="grid auto-rows-[minmax(17rem,auto)] gap-4 md:grid-cols-6">
        <Tile
          dark
          title="Secure Stripe payments"
          text="Card details go straight to Stripe's hosted checkout. RentNest never sees or stores them."
          className="md:col-span-6 lg:col-span-3 lg:row-span-2"
        >
          <div className="relative mx-auto h-56 max-w-sm sm:h-64">
            <div
              style={{ "--float-rotate": "-8deg" } as React.CSSProperties}
              className="absolute top-6 left-0 w-60 rotate-[-8deg] rounded-2xl border border-white/15 bg-linear-to-br from-[#2a2520] to-[#12100e] p-5 shadow-2xl shadow-black/50 motion-safe:animate-[soft-float_7s_ease-in-out_infinite]"
            >
              <div className="flex items-center justify-between">
                <span className="h-7 w-10 rounded-md bg-linear-to-br from-gold to-[#8e7448]" />
                <CreditCard className="size-5 text-white/60" />
              </div>
              <p className="mt-8 font-mono text-sm tracking-[0.2em] text-white/80">•••• •••• •••• 4242</p>
            </div>
            <div className="absolute right-0 bottom-0 w-56 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl motion-safe:animate-[soft-float_7s_ease-in-out_-3.5s_infinite]">
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <Lock className="size-3.5" /> Checkout by Stripe
              </p>
              <p className="mt-2 text-2xl font-medium tracking-tight">{formatCurrency(rent * LEASE_MONTHS)}</p>
              <span className="mt-3 flex h-9 items-center justify-center rounded-full bg-gold text-sm font-medium text-gold-foreground">
                Pay securely
              </span>
            </div>
          </div>
        </Tile>

        <Tile
          title="Real homes, real landlords"
          text="Every listing belongs to a registered landlord account, and admins can block anyone who breaks the rules."
          className="md:col-span-3"
        >
          <div className="flex items-center">
            {photos.map((photo, index) => (
              <span
                key={photo}
                className="relative -ml-3 size-16 overflow-hidden rounded-2xl border-4 border-card first:ml-0"
                style={{ zIndex: photos.length - index }}
              >
                <Image src={photo} alt="" fill sizes="64px" className="object-cover" />
              </span>
            ))}
            <span className="ml-3 grid size-10 place-items-center rounded-full bg-gold/15 text-bronze">
              <ShieldCheck className="size-5" />
            </span>
          </div>
        </Tile>

        <Tile
          title="Quick, clear answers"
          text="Landlords approve or reject with one click, and you see the status the moment it changes."
          className="md:col-span-3"
        >
          <div className="relative h-8">
            <Badge variant="pending" className="absolute motion-safe:animate-[swap-first_5s_ease-in-out_infinite]">
              Pending
            </Badge>
            <Badge
              variant="approved"
              className="absolute opacity-0 motion-safe:animate-[swap-second_5s_ease-in-out_infinite] motion-reduce:opacity-100"
            >
              Approved
            </Badge>
          </div>
        </Tile>

        <Tile
          title="Transparent pricing"
          text="Rent is listed per month, and you see the full lease total before you send a request."
          className="md:col-span-2"
        >
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatCurrency(rent)} × {LEASE_MONTHS} months
            <span className="mt-1 block text-3xl font-medium tracking-tighter text-foreground">
              {formatCurrency(rent * LEASE_MONTHS)}
            </span>
          </p>
        </Tile>

        <Tile
          title="A dashboard for every role"
          text="Tenants, landlords and admins each get a home base built for what they do."
          className="md:col-span-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <LayoutDashboard className="mr-1 size-5 text-bronze" />
            {["Tenant", "Landlord", "Admin"].map((role, index) => (
              <span
                key={role}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm motion-safe:animate-[soft-float_6s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * -2}s` }}
              >
                {role}
              </span>
            ))}
          </div>
        </Tile>

        <Tile
          title="Light or dark"
          text="Both themes are designed with care, and RentNest follows your system setting."
          className="md:col-span-2"
        >
          <span className="relative flex h-10 w-20 items-center rounded-full border border-border bg-linear-to-r from-[#f6f3ee] from-50% to-[#12100e] to-50% px-1">
            <span className="grid size-8 place-items-center rounded-full bg-[#f6f3ee] text-[#12100e] shadow">
              <Sun className="size-4" />
            </span>
            <span className="ml-auto grid size-8 place-items-center rounded-full text-[#f2eee7]">
              <Moon className="size-4" />
            </span>
          </span>
        </Tile>
      </Reveal>
    </div>
  );
}
