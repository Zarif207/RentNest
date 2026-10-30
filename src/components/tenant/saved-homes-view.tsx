"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Heart, House, MapPin, Ruler } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import type { FavoriteWithProperty } from "@/types";

const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

function SavedHomeCard({ favorite }: { favorite: FavoriteWithProperty }) {
  const remove = useToggleFavorite();
  const { property } = favorite;
  const available = property.availabilityStatus === "AVAILABLE";

  return (
    <article className="group relative flex flex-col rounded-3xl border border-border bg-card p-2 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <House className="size-10" aria-hidden />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur-md">
          <span aria-hidden className={cn("size-1.5 rounded-full", available ? "bg-[#7f9a6b]" : "bg-muted-foreground")} />
          {available ? "Available" : "Rented"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-gold px-3.5 py-1.5 text-sm font-semibold text-gold-foreground shadow-lg shadow-black/20">
          {formatCurrency(property.rentAmount)}
          <span className="font-normal opacity-80">/mo</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-2">
        <h2 className="line-clamp-1 text-lg font-medium tracking-tight">
          <Link href={`/properties/${property.id}`} className="outline-none after:absolute after:inset-0 after:rounded-3xl">
            {property.title}
          </Link>
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{formatLocation(property.city, property.division)}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
          <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4" aria-hidden /> {property.bedrooms} <span className="sr-only">bedrooms</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden /> {property.bathrooms} <span className="sr-only">bathrooms</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Ruler className="size-4" aria-hidden /> {formatNumber(property.area)} sq ft
            </li>
          </ul>
          {/* Above the stretched link so it stays clickable. */}
          <Button
            variant="outline"
            size="sm"
            className="relative z-10"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ propertyId: property.id, save: false })}
            aria-label={`Remove ${property.title} from saved homes`}
          >
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

/** /dashboard/tenant/favorites: the homes a tenant saved with the heart. */
export function SavedHomesView() {
  const favorites = useMyFavorites();
  const list = favorites.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved homes"
        description={
          favorites.data && list.length > 0
            ? `${list.length} ${list.length === 1 ? "home" : "homes"} you saved. Tap the heart on any listing to add more.`
            : "Homes you save with the heart show up here."
        }
      />

      {favorites.isError ? (
        <QueryError error={favorites.error} onRetry={() => void favorites.refetch()} />
      ) : favorites.isPending ? (
        <div className={GRID} aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="aspect-4/5 rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved homes yet"
          description="Tap the heart on a listing to keep it here while you decide."
          action={
            <Button asChild>
              <Link href="/properties">
                Browse homes <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className={GRID}>
          {list.map((favorite) => (
            <li key={favorite.id}>
              <SavedHomeCard favorite={favorite} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
