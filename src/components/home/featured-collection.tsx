"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/shared/photo";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bath, BedDouble, House, Ruler } from "lucide-react";
import { smoothScrollTo } from "@/components/motion/smooth-scroll-provider";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { ListingSwitch } from "@/components/properties/listing-switch";
import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { Button } from "@/components/ui/button";
import { useIsDesktop, useMotionOk } from "@/hooks/use-motion";
import { formatNumber } from "@/lib/format";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { LISTING_PATHS } from "@/lib/listing";
import { cn } from "@/lib/utils";
import type { ListingType } from "@/types";

/** A real featured listing, flattened on the server for this client section. */
export type FeaturedHome = {
  id: string;
  title: string;
  image: string | null;
  price: string;
  location: string;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
};

const pad = (n: number) => String(n).padStart(2, "0");
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const MODES: ListingType[] = ["RENT", "SALE"];

/** The section, behind a small error boundary so a failure can't blank the page. */
export function FeaturedCollection(props: FeaturedCollectionProps) {
  return (
    <SectionErrorBoundary label="The featured collection">
      <FeaturedScene {...props} />
    </SectionErrorBoundary>
  );
}

type FeaturedCollectionProps = {
  rentHomes: FeaturedHome[];
  saleHomes: FeaturedHome[];
  title?: string | null;
};

/**
 * Featured collection. Desktop: the section pins and the cards travel
 * horizontally as you scroll down; cards swing in from the right on the Y
 * axis, flatten at the center and soften as they leave. Under 768px and with
 * reduced motion it's a native swipe carousel with arrow buttons. Both modes
 * drive the same progress bar and "01 / 08" counter (hidden with two homes or
 * fewer, which sit centered).
 *
 * Both lists render once, stacked in one grid cell; the Rent | Buy switch only
 * cross-fades them, so the section (and its pinned scene) never remounts.
 */
function FeaturedScene({ rentHomes, saleHomes, title }: FeaturedCollectionProps) {
  const lists: Record<ListingType, FeaturedHome[]> = { RENT: rentHomes, SALE: saleHomes };
  const [mode, setMode] = useState<ListingType>(rentHomes.length > 0 ? "RENT" : "SALE");
  const homes = lists[mode];
  const total = homes.length;
  const few = total <= 2;
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<Partial<Record<ListingType, HTMLUListElement | null>>>({});
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  // Read by scroll callbacks that outlive a render.
  const modeRef = useRef(mode);
  const totalRef = useRef(total);
  const motionOk = useMotionOk();
  const isDesktop = useIsDesktop();
  const pinned = motionOk && isDesktop;

  // `index` defaults to the card nearest the progress point (pinned mode).
  const setProgress = (progress: number, index = Math.round(progress * Math.max(totalRef.current - 1, 0))) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(progress, 0.02)})`;
    if (countRef.current) countRef.current.textContent = pad(Math.min(index + 1, Math.max(totalRef.current, 1)));
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const wrap = wrapRef.current;
      if (!pinned || !section || !wrap) return;

      // How far the visible list travels; a short list fits and stays put.
      const distance = () =>
        Math.max(0, (trackRefs.current[modeRef.current]?.offsetWidth ?? 0) - window.innerWidth);
      const travel = gsap.to(wrap, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });
      triggerRef.current = travel.scrollTrigger ?? null;

      gsap.utils.toArray<HTMLElement>("[data-card]", wrap).forEach((card) => {
        const inner = card.querySelector("[data-card-inner]");
        // Entering from the right: turned away on Y, flattening by the center.
        gsap.fromTo(
          inner,
          { rotationY: -18, transformOrigin: "left center" },
          {
            rotationY: 0,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: travel, start: "left right", end: "center center", scrub: true },
          },
        );
        // Leaving on the left: slightly smaller, softer and dimmer.
        gsap.to(inner, {
          scale: 0.9,
          opacity: 0.55,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: travel, start: "center center", end: "right left", scrub: true },
        });
      });

      // Images above may still be loading; re-measure once everything settles.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => {
        window.removeEventListener("load", refresh);
        triggerRef.current = null;
      };
    },
    // Built once per mode of display; switching lists only re-measures it (below).
    { scope: sectionRef, dependencies: [pinned] },
  );

  // After a switch: re-measure the scene once for the new list and start it
  // from its first card; the carousel just scrolls back to the start.
  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    totalRef.current = total;
    setProgress(0, 0);
    const trigger = triggerRef.current;
    if (pinned && trigger) {
      const wasInside = window.scrollY > trigger.start;
      ScrollTrigger.refresh();
      if (wasInside) smoothScrollTo(trigger.start);
    } else {
      trackRefs.current[mode]?.scrollTo({ left: 0 });
    }
    // setProgress only touches refs; the effect runs for mode changes alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onNativeScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const el = event.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    // Count whole cards scrolled past; at the very end the last cards share
    // the view, so report the final one.
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth;
    const index = progress >= 0.99 ? total - 1 : Math.min(Math.round(el.scrollLeft / step), total - 1);
    setProgress(progress, Math.max(index, 0));
  };

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRefs.current[mode];
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    el.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: motionOk ? "smooth" : "auto" });
  };

  if (rentHomes.length + saleHomes.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="featured-title"
      className={cn("relative overflow-hidden bg-surface", pinned ? "h-svh" : "py-24")}
    >
      <div className={cn("flex flex-col", pinned && "h-full justify-center gap-10 pt-20 pb-10")}>
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Featured collection</p>
            <h2 id="featured-title" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
              {title ?? "Homes worth the move"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ListingSwitch value={mode} onChange={setMode} label="Featured homes to rent or buy" />
            {!pinned && !few && (
              <>
                <Button variant="outline" size="icon" aria-label="Previous home" onClick={() => scrollByCard(-1)}>
                  <ArrowLeft />
                </Button>
                <Button variant="outline" size="icon" aria-label="Next home" onClick={() => scrollByCard(1)}>
                  <ArrowRight />
                </Button>
              </>
            )}
            <Button asChild variant="outline">
              <Link href={LISTING_PATHS[mode]}>
                View all <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Both lists share one grid cell, so the section keeps its height when switching. */}
        <div ref={wrapRef} className={cn("grid", pinned ? "w-max min-w-full will-change-transform" : "mt-10")}>
          {MODES.map((listMode) => {
            const list = lists[listMode];
            const active = listMode === mode;
            const fade = cn(
              "[grid-area:1/1] transition-opacity duration-500 ease-out motion-reduce:transition-none",
              !active && "pointer-events-none opacity-0",
            );
            if (list.length === 0) {
              return (
                <div
                  key={listMode}
                  inert={!active}
                  aria-hidden={!active || undefined}
                  className={cn(fade, "mx-auto flex w-[min(34rem,calc(100vw-2rem))] flex-col items-center justify-center gap-4 self-center rounded-3xl border border-dashed border-border p-10 text-center")}
                >
                  <House className="size-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    No featured homes {listMode === "RENT" ? "for rent" : "for sale"} right now.
                  </p>
                  <Button asChild variant="outline">
                    <Link href={LISTING_PATHS[listMode]}>
                      Browse homes {listMode === "RENT" ? "for rent" : "for sale"} <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>
              );
            }
            const listFew = list.length <= 2;
            return (
              <ul
                key={listMode}
                ref={(el) => {
                  trackRefs.current[listMode] = el;
                }}
                inert={!active}
                aria-hidden={!active || undefined}
                onScroll={pinned || !active ? undefined : onNativeScroll}
                aria-label={listMode === "RENT" ? "Featured homes for rent" : "Featured homes for sale"}
                className={cn(
                  fade,
                  "flex gap-6 px-4 perspective-[1600px] sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]",
                  pinned
                    ? listFew
                      ? "w-screen justify-center justify-self-start"
                      : "w-max justify-self-start"
                    : cn(
                        "snap-x snap-mandatory scroll-px-4 overflow-x-auto pb-4 scrollbar-none sm:scroll-px-6",
                        listFew && "justify-center-safe",
                      ),
                )}
              >
                {list.map((home, index) => (
                <li key={home.id} data-card className="w-[82vw] shrink-0 snap-start sm:w-[60vw] md:w-[min(34rem,46vw)]">
                  <div data-card-inner className="relative h-full transform-3d">
                    <Link
                      href={`/properties/${home.id}`}
                      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span className="relative block aspect-5/4 overflow-hidden rounded-2xl bg-muted">
                        {home.image ? (
                          <Image
                            src={home.image}
                            alt={home.title}
                            fill
                            sizes="(min-width: 768px) 34rem, 82vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-muted-foreground">
                            <House className="size-10" aria-hidden />
                          </span>
                        )}
                        <span className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                          {pad(index + 1)} · {home.type}
                        </span>
                      </span>
                      <span className="flex flex-1 flex-col gap-4 px-2 pt-5 pb-2">
                        <span className="flex items-start justify-between gap-4">
                          <span className="min-w-0">
                            <span className="block truncate text-xl font-medium tracking-tight">{home.title}</span>
                            <span className="block truncate text-sm text-muted-foreground">{home.location}</span>
                          </span>
                          <span className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-sm font-medium text-bronze">
                            {home.price}
                          </span>
                        </span>
                        <span className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                          <span className="flex flex-wrap gap-x-4 gap-y-1">
                            {isCount(home.bedrooms) && (
                              <span className="flex items-center gap-1.5">
                                <BedDouble className="size-4" aria-hidden /> {home.bedrooms} bd
                              </span>
                            )}
                            {isCount(home.bathrooms) && (
                              <span className="flex items-center gap-1.5">
                                <Bath className="size-4" aria-hidden /> {home.bathrooms} ba
                              </span>
                            )}
                            {isCount(home.area) && home.area > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Ruler className="size-4" aria-hidden /> {formatNumber(home.area)} sqft
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            View <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                          </span>
                        </span>
                      </span>
                    </Link>
                    <FavoriteButton propertyId={home.id} title={home.title} className="absolute top-6 right-6 z-10 translate-z-6" />
                  </div>
                </li>
                ))}
              </ul>
            );
          })}
        </div>

        {!few && (
          <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8" aria-hidden>
            <span className="text-sm font-medium tabular-nums">
              <span ref={countRef}>01</span>
              <span className="text-muted-foreground"> / {pad(total)}</span>
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-border">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left bg-foreground"
                style={{ transform: `scaleX(${1 / total})` }}
              />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
