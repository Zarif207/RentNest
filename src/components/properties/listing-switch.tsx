"use client";

import { cn } from "@/lib/utils";
import type { ListingType } from "@/types";

const DEFAULT_LABELS: Record<ListingType, string> = { RENT: "Rent", SALE: "Buy" };

/**
 * A small Rent | Buy segmented switch (a radio group). `tone="glass"` is for
 * dark photos (the hero); the default sits on the page background.
 */
export function ListingSwitch({
  value,
  onChange,
  label = "Listing type",
  labels = DEFAULT_LABELS,
  tone = "default",
  disabled = false,
  className,
}: {
  value: ListingType;
  onChange: (value: ListingType) => void;
  label?: string;
  /** Option text; "Rent" / "Buy" by default (owners see "For rent" / "For sale"). */
  labels?: Record<ListingType, string>;
  tone?: "default" | "glass";
  disabled?: boolean;
  className?: string;
}) {
  const glass = tone === "glass";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex rounded-full p-1",
        glass ? "border border-white/15 bg-white/10 backdrop-blur-xl" : "border border-border bg-card",
        className,
      )}
      onKeyDown={(event) => {
        // Arrow keys move between the two options, like native radios.
        if (disabled || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const next = value === "RENT" ? "SALE" : "RENT";
        onChange(next);
        event.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
      }}
    >
      {(["RENT", "SALE"] as const).map((option) => {
        const checked = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            data-value={option}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "min-w-20 rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60",
              glass
                ? checked
                  ? "bg-gold text-gold-foreground focus-visible:ring-gold/60"
                  : "text-white/80 hover:text-white focus-visible:ring-white/40"
                : checked
                  ? "bg-foreground text-background focus-visible:ring-ring/50"
                  : "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50",
            )}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
