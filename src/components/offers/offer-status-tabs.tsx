"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OFFER_STATUS_LABELS } from "@/lib/offers";
import type { OfferStatus } from "@/types";

const ALL = "ALL";
const TABS = [ALL, "PENDING", "COUNTERED", "ACCEPTED", "DEPOSIT_PAID", "COMPLETED", "REJECTED", "WITHDRAWN", "EXPIRED"] as const;

/** The offer status selected by ?status= (undefined = All). */
export function useOfferStatusParam(): OfferStatus | undefined {
  const requested = useSearchParams().get("status")?.toUpperCase();
  const tab = TABS.find((value) => value === requested);
  return tab && tab !== ALL ? tab : undefined;
}

/** Offer status tabs kept in ?status=, so a filtered list can be bookmarked. */
export function OfferStatusTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const status = useOfferStatusParam();

  return (
    <Tabs
      value={status ?? ALL}
      onValueChange={(value) =>
        router.replace(value === ALL ? pathname : `${pathname}?status=${value}`, { scroll: false })
      }
    >
      <div className="max-w-full overflow-x-auto scrollbar-none">
        <TabsList>
          {TABS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {value === ALL ? "All" : OFFER_STATUS_LABELS[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
