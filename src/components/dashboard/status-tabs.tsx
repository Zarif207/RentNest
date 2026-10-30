"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEnumLabel } from "@/lib/format";
import type { BookingStatus } from "@/types";

const ALL = "ALL";
const TABS = [ALL, "PENDING", "APPROVED", "ACTIVE", "COMPLETED", "REJECTED"] as const;

/** The booking status selected by ?status= (undefined = All). */
export function useStatusParam(): BookingStatus | undefined {
  const requested = useSearchParams().get("status")?.toUpperCase();
  const tab = TABS.find((value) => value === requested);
  return tab && tab !== ALL ? (tab as BookingStatus) : undefined;
}

/** Booking status tabs kept in ?status=, so a filtered list can be bookmarked. */
export function StatusTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const status = useStatusParam();

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
              {value === ALL ? "All" : formatEnumLabel(value)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
