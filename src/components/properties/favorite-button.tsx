"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/** Save-for-later heart. UI only: there's no favorites API, so it lives in local state. */
export function FavoriteButton({ title, className }: { title: string; className?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={() => setSaved((value) => !value)}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-background/85 backdrop-blur-md transition-[transform,background-color] outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:hover:scale-100",
        className,
      )}
    >
      <Heart
        aria-hidden
        className={cn(
          "size-4 transition-colors duration-300",
          saved ? "fill-gold text-gold" : "text-foreground",
        )}
      />
    </button>
  );
}
