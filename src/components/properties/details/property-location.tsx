"use client";

import dynamic from "next/dynamic";
import { Expand, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapProperty, PropertyWithRelations } from "@/types";

// Leaflet needs the browser.
const ListingsMap = dynamic(() => import("@/components/maps/listings-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

/**
 * "Location" card on the details page: the US with every listing, this home
 * as the red pin, and a button that opens the same map full screen.
 */
export function PropertyLocation({
  property,
  pins,
}: {
  property: PropertyWithRelations;
  pins: MapProperty[];
}) {
  const focus: MapProperty | null =
    property.latitude !== null && property.longitude !== null
      ? {
          id: property.id,
          title: property.title,
          latitude: property.latitude,
          longitude: property.longitude,
          rentAmount: property.rentAmount,
          city: property.city,
          division: property.division,
          availabilityStatus: property.availabilityStatus,
          image: property.images[0] ?? null,
        }
      : null;

  return (
    <div className="space-y-4">
      <div className="relative isolate h-80 overflow-hidden rounded-3xl border border-border bg-muted sm:h-96">
        <ListingsMap pins={pins} focus={focus} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="absolute top-3 right-3 z-1000 shadow-lg shadow-black/10">
              <Expand data-icon="inline-start" /> Expand map
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-[90svh] w-[calc(100vw-1.5rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,90rem)]">
            <DialogHeader className="border-b border-border px-5 py-4 pr-14">
              <DialogTitle>{property.title}</DialogTitle>
              <DialogDescription>
                {focus ? "The red pin is this home. Click any other pin to see that listing." : "Exact location not available."}
              </DialogDescription>
            </DialogHeader>
            {/* Let the wheel zoom the map instead of Lenis scrolling the page. */}
            <div data-lenis-prevent className="relative isolate min-h-0 flex-1">
              <ListingsMap pins={pins} focus={focus} scrollWheelZoom />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {!focus && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinOff className="size-4 shrink-0" aria-hidden /> Exact location not available. The map shows every other
          listing.
        </p>
      )}
    </div>
  );
}
