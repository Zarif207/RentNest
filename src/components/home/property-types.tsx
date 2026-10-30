import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import type { PropertyType } from "@/types";

/** A property type with its real listing count and a photo. */
export type TypeTile = {
  type: PropertyType;
  label: string;
  description: string;
  count: number | null;
  image: string;
};

/** Four tall type cards that tilt toward the cursor and open a filtered browse. */
export function PropertyTypes({ types }: { types: TypeTile[] }) {
  return (
    <Reveal stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {types.map((tile) => (
        <TiltCard key={tile.type} max={6} className="rounded-3xl">
          <Link
            href={`/properties?propertyType=${tile.type}`}
            className="group relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-3xl bg-muted p-4 text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6"
          >
            <Image
              src={tile.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:rotate-45 sm:top-6 sm:right-6">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
            <span className="relative">
              <span className="block text-2xl font-medium tracking-tighter sm:text-3xl">{tile.label}</span>
              <span className="mt-1 hidden text-sm text-white/75 sm:block">{tile.description}</span>
              {tile.count !== null && (
                <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                  {tile.count === 0 ? "None listed yet" : `${tile.count} ${tile.count === 1 ? "home" : "homes"}`}
                </span>
              )}
            </span>
          </Link>
        </TiltCard>
      ))}
    </Reveal>
  );
}
