"use client";

import { PropertyCard } from "@/components/properties/property-card";
import { useIsDesktop } from "@/hooks/use-motion";
import type { Property } from "@/types";

// Cards per half of the track: enough to cover the screen before the loop
// repeats. Phones (and the server render) need few, which keeps the page's
// HTML and hydration light; md+ adds copies once it hydrates.
const MIN_CARDS = { phone: 3, desktop: 8 };

/**
 * Tilted, infinitely scrolling row of the latest listings (pure CSS).
 * The track holds the list twice and slides by -50%, so the loop is seamless.
 * Hover pauses it; with reduced motion it becomes a static, scrollable row.
 */
export function ListingsMarquee({ properties }: { properties: Property[] }) {
  const isDesktop = useIsDesktop();
  const repeats = Math.ceil(MIN_CARDS[isDesktop ? "desktop" : "phone"] / properties.length);
  const loop = Array.from({ length: repeats }, () => properties).flat();

  return (
    <div className="-mx-16 rotate-[-8deg] py-6 motion-reduce:rotate-0">
      <div className="overflow-hidden motion-reduce:overflow-x-auto">
        {/* No backdrop blur on the cards' chips here: blurring behind ~50 moving
            chips every frame is the most expensive paint on the page. */}
        <ul className="flex w-max animate-marquee gap-6 hover:paused motion-reduce:animate-none **:backdrop-blur-none">
          {[...loop, ...loop].map((property, index) => (
            // Only the first copy of each listing is exposed; repeats are
            // decorative and hidden from screen readers and the tab order.
            <li
              key={`${property.id}-${index}`}
              className="w-72 shrink-0 rounded-3xl bg-background p-3 shadow-lg shadow-black/5 sm:w-80"
              aria-hidden={index >= properties.length || undefined}
              inert={index >= properties.length || undefined}
            >
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
