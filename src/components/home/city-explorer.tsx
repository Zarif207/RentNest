"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** One city, aggregated on the server from real listings. */
export type ExploreCity = {
  city: string;
  label: string;
  count: number;
  startingPrice: string;
  image: string | null;
};

/**
 * Accordion row of tall city tiles: hovering or focusing a tile grows it
 * (flex-grow) and reveals its details. Under 768px the tiles stack, each
 * fully open.
 */
export function CityExplorer({ cities }: { cities: ExploreCity[] }) {
  const [active, setActive] = useState(0);

  return (
    <ul className="flex flex-col gap-3 md:h-136 md:flex-row">
      {cities.map((city, index) => {
        const open = index === active;
        return (
          <li
            key={city.city}
            onPointerEnter={() => setActive(index)}
            className={cn(
              "relative h-72 overflow-hidden rounded-3xl bg-muted transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:h-auto md:min-w-0",
              open ? "md:grow-4" : "md:grow",
            )}
          >
            <Link
              href={`/properties?city=${encodeURIComponent(city.city)}`}
              onFocus={() => setActive(index)}
              className="group absolute inset-0 block text-white outline-none focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:ring-inset"
            >
              {city.image && (
                <Image
                  src={city.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={cn(
                    "object-cover transition-transform duration-1000 ease-out motion-reduce:transition-none",
                    open && "md:scale-105",
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-500",
                  !open && "md:bg-black/45",
                )}
              />

              {/* Collapsed (desktop): the name runs up the tile. */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-6 left-1/2 hidden origin-bottom-left translate-x-3 -rotate-90 text-lg font-medium tracking-tight whitespace-nowrap transition-opacity duration-300 md:block",
                  open ? "opacity-0" : "opacity-100 delay-200",
                )}
              >
                {city.city}
              </span>

              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 transition-[opacity,translate] duration-500 sm:p-8",
                  open
                    ? "delay-200 md:translate-y-0 md:opacity-100"
                    : "md:pointer-events-none md:translate-y-4 md:opacity-0",
                )}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm text-white/75">
                    <MapPin className="size-4" aria-hidden /> {city.label}
                  </span>
                  <span className="mt-1 block truncate text-3xl font-medium tracking-tighter sm:text-4xl">
                    {city.city}
                  </span>
                  <span className="mt-2 block text-sm text-white/80">
                    {city.count} {city.count === 1 ? "home" : "homes"} · from {city.startingPrice}/mo
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors group-hover:bg-white/20">
                  Explore <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
