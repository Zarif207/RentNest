"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

/**
 * Save-for-later heart. Tenants toggle it (optimistic, with a little pop);
 * signed-out visitors are sent to log in and come back here; landlords and
 * admins don't see it.
 */
export function FavoriteButton({
  propertyId,
  title,
  size = "default",
  className,
}: {
  propertyId: string;
  title: string;
  size?: "default" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const ids = useFavoriteIds();
  const toggle = useToggleFavorite();
  // Bumped on each toggle to replay the pop animation.
  const [pops, setPops] = useState(0);

  if (user && user.role !== "TENANT") return null;

  const saved = ids.data?.includes(propertyId) ?? false;

  const onClick = (event: React.MouseEvent) => {
    // Cards are links; the heart must not open the listing.
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      const here = `${pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(here)}`);
      return;
    }
    setPops((count) => count + 1);
    toggle.mutate({ propertyId, save: !saved });
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      // Until the session is known a click can't be handled, so it can't be lost either.
      disabled={isLoading}
      onClick={onClick}
      className={cn(
        "grid place-items-center rounded-full bg-background/85 backdrop-blur-md transition-[transform,background-color] outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:hover:scale-100",
        size === "lg" ? "size-12 border border-border" : "size-9",
        className,
      )}
    >
      <Heart
        key={pops}
        aria-hidden
        className={cn(
          "transition-colors duration-300",
          size === "lg" ? "size-5" : "size-4",
          saved ? "fill-gold text-gold" : "text-foreground",
          pops > 0 && "animate-[heart-pop_0.45s_ease-out]",
        )}
      />
    </button>
  );
}
