"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

const chipClass =
  "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50";

/** Horizontal chip row; each chip opens /properties filtered by that category. */
export function CategoryChips({ categories }: { categories: Category[] }) {
  const scroller = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-3">
      <ul
        ref={scroller}
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <li>
          <Link
            href="/properties"
            className={`${chipClass} block border-foreground bg-foreground text-background hover:bg-foreground/90`}
          >
            All homes
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/properties?categoryId=${category.id}`}
              className={`${chipClass} block`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden shrink-0 gap-2 sm:flex">
        <Button variant="outline" size="icon" aria-label="Scroll categories left" onClick={() => scroll(-1)}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Scroll categories right" onClick={() => scroll(1)}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
