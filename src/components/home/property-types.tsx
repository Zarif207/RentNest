"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { PropertyType } from "@/types";

/** A property type with its real listing count and a photo. */
export type TypeTile = {
  type: PropertyType;
  label: string;
  description: string;
  count: number | null;
  image: string;
};

const hrefFor = (tile: TypeTile) => `/properties?propertyType=${tile.type}`;
const countLabel = (count: number | null) =>
  count === null ? null : count === 0 ? "None listed yet" : `${count} ${count === 1 ? "home" : "homes"}`;

/** Stacked photos that crossfade to the active one. */
function Crossfade({ types, active, sizes }: { types: TypeTile[]; active: number; sizes: string }) {
  return types.map((tile, index) => (
    <Image
      key={tile.type}
      src={tile.image}
      alt=""
      fill
      sizes={sizes}
      className={cn(
        "object-cover transition-[opacity,scale] duration-700 ease-out motion-reduce:transition-none",
        index === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
      )}
    />
  ));
}

/**
 * "A place for every chapter": an interactive type index. Desktop shows the
 * types as huge serif lines; hovering one underlines it in gold, dims the
 * rest and crossfades the sticky photo on the right. Lines rise in one by
 * one on scroll. Phones get horizontal snap cards instead.
 */
export function PropertyTypes({ types }: { types: TypeTile[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const motionOk = useMotionOk();
  // Start on the first type that has homes, so the panel never opens on an empty one.
  const [active, setActive] = useState(() => Math.max(0, types.findIndex((tile) => (tile.count ?? 0) > 0)));
  const [hovering, setHovering] = useState(false);
  const current = types[active] ?? types[0];

  // Scroll: each line rises out of its own mask, one after another.
  useGSAP(
    () => {
      if (!motionOk) return;
      gsap.from("[data-type-line]", {
        yPercent: 110,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        scrollTrigger: { trigger: listRef.current, start: "top 80%", once: true },
      });
    },
    { scope: rootRef, dependencies: [motionOk] },
  );

  if (!current) return null;

  return (
    <div ref={rootRef}>
      {/* Desktop: the type index. */}
      <div className="hidden gap-12 lg:grid lg:grid-cols-[1.25fr_1fr] xl:gap-20">
        <div>
          <ul
            ref={listRef}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className="border-t border-border"
          >
            {types.map((tile, index) => {
              const isActive = index === active;
              return (
                <li key={tile.type} className="overflow-hidden border-b border-border">
                  <div data-type-line>
                    <Link
                      href={hrefFor(tile)}
                      onPointerEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      aria-label={`${tile.label}: ${countLabel(tile.count) ?? "browse"}`}
                      className={cn(
                        "group relative flex items-center gap-6 py-5 outline-none transition-opacity duration-500 focus-visible:opacity-100",
                        hovering && !isActive && "opacity-25",
                      )}
                    >
                      <span className="w-8 self-start pt-4 text-xs text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">
                        <span className="font-serif text-[clamp(3.5rem,6.5vw,6.5rem)] leading-[0.95] font-normal tracking-[-0.02em]">
                          {tile.label}
                        </span>
                        {tile.count !== null && (
                          <sup className="ml-3 align-super text-sm font-medium text-bronze tabular-nums">
                            ({String(tile.count).padStart(2, "0")})
                          </sup>
                        )}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-12 shrink-0 place-items-center rounded-full border border-border transition-all duration-500",
                          isActive && "rotate-45 border-foreground bg-foreground text-background",
                        )}
                      >
                        <ArrowUpRight className="size-5" />
                      </span>
                      {/* Gold underline slides in under the active line. */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gold transition-transform duration-700 ease-out",
                          isActive ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sticky top-28 self-start">
          {/* About the list's height, and never taller than the screen. */}
          <div className="relative h-[min(34rem,calc(100svh-9rem))] overflow-hidden rounded-3xl bg-muted">
            <Crossfade types={types} active={active} sizes="(min-width: 1280px) 520px, 40vw" />
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white" aria-live="polite">
              <p className="text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
                {countLabel(current.count)}
              </p>
              <p className="mt-2 text-lg">{current.description}</p>
              <Link
                href={hrefFor(current)}
                className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium backdrop-blur-md transition-colors outline-none hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-gold/60"
              >
                Browse {current.label.toLowerCase()}s
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: horizontal snap cards. */}
      <ul
        aria-label="Property types"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:hidden"
      >
        {types.map((tile) => (
          <li key={tile.type} className="w-[78%] shrink-0 snap-start sm:w-[45%]">
            <Link
              href={hrefFor(tile)}
              className="relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-3xl bg-muted p-5 text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Image src={tile.image} alt="" fill sizes="(min-width: 640px) 45vw, 78vw" className="object-cover" />
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
              <span className="relative">
                <span className="block font-serif text-5xl leading-none font-normal tracking-[-0.02em]">{tile.label}</span>
                {tile.count !== null && (
                  <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    {countLabel(tile.count)}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
