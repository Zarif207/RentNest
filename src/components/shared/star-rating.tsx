import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only 0–5 star display (partial ratings round to the nearest star). */
export function StarRating({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);

  return (
    <div
      className={cn("flex gap-0.5", className)}
      role="img"
      aria-label={`Rated ${rating.toFixed(1).replace(/\.0$/, "")} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-[1em]",
            index < filled ? "fill-gold text-gold" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
