"use client";

import dynamic from "next/dynamic";
import { MapPin, RotateCcw } from "lucide-react";
import type { Coordinates } from "@/components/maps/location-picker-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LocationPickerMap = dynamic(() => import("@/components/maps/location-picker-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

/**
 * Optional exact pin for a listing. Without one, the backend finds the spot
 * from the street address when the form is saved.
 */
export function LocationPicker({
  value,
  initial,
  onChange,
}: {
  value: Coordinates | null;
  /** The saved pin when editing, so "Undo" can go back to it. */
  initial: Coordinates | null;
  onChange: (value: Coordinates | null) => void;
}) {
  const changed = JSON.stringify(value) !== JSON.stringify(initial);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Map pin</p>
          <p className="text-sm text-muted-foreground">
            {value
              ? "Drag the pin or click the map to move it."
              : "We'll find it from the address when you save. For an exact spot, click the map."}
          </p>
        </div>
        {value && !initial && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
            <MapPin data-icon="inline-start" /> Find from address
          </Button>
        )}
        {initial && changed && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(initial)}>
            <RotateCcw data-icon="inline-start" /> Undo pin change
          </Button>
        )}
      </div>
      <div className="relative isolate h-72 overflow-hidden rounded-2xl border border-border bg-muted sm:h-80">
        <LocationPickerMap value={value} onChange={onChange} />
      </div>
      {value && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}
