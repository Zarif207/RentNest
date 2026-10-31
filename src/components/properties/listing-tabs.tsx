import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ListingType } from "@/types";

type Tab = { value: ListingType | null; label: string; href: string };

const segmentClass =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Rent | Buy | All as links between the browse pages (the active one is filled). */
export function ListingTabs({ active, tabs }: { active: ListingType | null; tabs: Tab[] }) {
  return (
    <nav aria-label="Listing type" className="inline-flex rounded-full border border-border bg-card p-1">
      {tabs.map((tab) => {
        const current = tab.value === active;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              segmentClass,
              current ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
