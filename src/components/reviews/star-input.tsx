"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

type StarInputProps = {
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  labelledBy: string;
  invalid?: boolean;
};

/**
 * 1–5 star picker built on native radios: Tab focuses the group and the
 * arrow keys change the rating, like any radio group.
 */
export function StarInput({ name, value, onChange, labelledBy, invalid }: StarInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value || 0;

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        className="flex"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer rounded-lg p-1 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => {
                // Drop the hover preview so keyboard changes show immediately.
                setHovered(0);
                onChange(star);
              }}
              aria-label={`${star} ${star === 1 ? "star" : "stars"} – ${LABELS[star]}`}
              className="sr-only"
            />
            <Star
              aria-hidden
              className={cn(
                "size-8 transition-colors",
                star <= shown ? "fill-gold text-gold" : "text-muted-foreground/40",
              )}
            />
          </label>
        ))}
      </div>
      <span className="text-sm text-muted-foreground" aria-hidden>
        {LABELS[shown]}
      </span>
    </div>
  );
}
