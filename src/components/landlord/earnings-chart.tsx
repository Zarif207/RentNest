"use client";

import { addMonths, format, startOfMonth } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/format";
import type { LandlordBooking } from "@/types";

const MONTHS = 6;

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "Nice" axis maximum: 1, 2, 2.5 or 5 × a power of ten. */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((multiple) => multiple * power >= value) ?? 10;
  return step * power;
}

type MonthTotal = { key: string; label: string; total: number };

/**
 * Earnings (full lease value of ACTIVE + COMPLETED rentals) grouped by the
 * month the lease starts, for the 6 months ending at the latest lease start.
 */
export function monthlyEarnings(requests: LandlordBooking[]): MonthTotal[] {
  const earning = requests.filter((r) => r.bookingStatus === "ACTIVE" || r.bookingStatus === "COMPLETED");
  if (earning.length === 0) return [];

  const latest = earning.reduce(
    (max, r) => (new Date(r.moveInDate) > max ? new Date(r.moveInDate) : max),
    new Date(earning[0].moveInDate),
  );
  const months = Array.from({ length: MONTHS }, (_, index) =>
    startOfMonth(addMonths(latest, index - (MONTHS - 1))),
  );

  return months.map((month) => {
    const key = format(month, "yyyy-MM");
    const total = earning
      .filter((r) => format(new Date(r.moveInDate), "yyyy-MM") === key)
      .reduce((sum, r) => sum + Number(r.totalRent), 0);
    return { key, label: format(month, "MMM yyyy"), total };
  });
}

/** Single-series column chart in plain HTML; every value is also in the table below. */
export function EarningsChart({ data }: { data: MonthTotal[] }) {
  const max = niceMax(Math.max(...data.map((month) => month.total)));
  const ticks = [max, max / 2, 0];

  return (
    <figure className="space-y-3">
      <div className="flex gap-3">
        {/* Y-axis ticks (recessive) */}
        <div className="flex h-48 flex-col justify-between pb-6 text-right text-xs text-muted-foreground" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {compactCurrency.format(tick)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Gridlines at the tick positions */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-border" />
            ))}
          </div>

          <ul className="relative flex h-48 items-end justify-around gap-2" aria-label="Earnings by lease start month">
            {data.map((month) => {
              const height = (month.total / max) * 100;
              return (
                <li key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* Hit target is the whole column, not just the painted bar. */}
                        <button
                          type="button"
                          className="group flex h-full w-full items-end justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          aria-label={`${month.label}: ${formatCurrency(month.total)}`}
                        >
                          <span className="relative flex w-6 flex-col items-center" style={{ height: `${height}%` }}>
                            {month.total > 0 && (
                              <span className="absolute -top-5 text-xs font-medium whitespace-nowrap text-foreground">
                                {compactCurrency.format(month.total)}
                              </span>
                            )}
                            <span className="h-full w-full rounded-t-[4px] bg-chart-2 transition-opacity group-hover:opacity-80" />
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-semibold">{formatCurrency(month.total)}</span>{" "}
                        <span className="opacity-80">{month.label}</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="h-4.5 text-xs text-muted-foreground">{month.label.slice(0, 3)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <figcaption className="text-xs text-muted-foreground">
        Full lease value of active and completed rentals, by the month the lease starts.
      </figcaption>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 font-medium">Month</th>
              <th className="py-1 text-right font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={month.key} className="border-t">
                <td className="py-1">{month.label}</td>
                <td className="py-1 text-right tabular-nums">{formatCurrency(month.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
