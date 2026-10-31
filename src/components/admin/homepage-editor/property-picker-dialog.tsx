"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, House, Search } from "lucide-react";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProperties } from "@/hooks/use-admin";
import { usePropertyStates } from "@/hooks/use-site-settings";
import { formatEnumLabel } from "@/lib/format";
import { listingPriceLabel } from "@/lib/listing";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES, type PropertyType } from "@/types";

const ANY = "any";

type PropertyPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Currently picked ids, in order. */
  selected: string[];
  max: number;
  onConfirm: (ids: string[]) => void;
};

/**
 * Search every listing (admin endpoint) with type/state filters and pick up
 * to `max`. New picks are appended after the existing ones, keeping order.
 */
export function PropertyPickerDialog({ open, onOpenChange, title, selected, max, onConfirm }: PropertyPickerDialogProps) {
  const [picked, setPicked] = useState(selected);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>();
  const [division, setDivision] = useState<string | undefined>();
  const properties = useAdminProperties({ searchTerm: searchTerm || undefined, propertyType, division, limit: 24 });
  const states = usePropertyStates();

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : current.length < max ? [...current, id] : current,
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Start from the current picks every time it opens.
        if (next) setPicked(selected);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pick up to {max}. {picked.length} selected.
          </DialogDescription>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_10rem_11rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <DebouncedInput
                type="search"
                aria-label="Search properties"
                placeholder="Search title, city or address…"
                className="h-10 rounded-full pl-10"
                value={searchTerm}
                onCommit={setSearchTerm}
              />
            </div>
            <Select value={propertyType ?? ANY} onValueChange={(value) => setPropertyType(value === ANY ? undefined : (value as PropertyType))}>
              <SelectTrigger aria-label="Filter by type" className="h-10 w-full rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All types</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatEnumLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={division ?? ANY} onValueChange={(value) => setDivision(value === ANY ? undefined : value)}>
              <SelectTrigger aria-label="Filter by state" className="h-10 w-full rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All states</SelectItem>
                {(states.data ?? []).map((state) => (
                  <SelectItem key={state.state} value={state.state}>
                    {state.state} ({state.propertyCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {properties.isPending ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : (properties.data?.data ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No properties match these filters.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-3">
              {properties.data?.data.map((property) => {
                const order = picked.indexOf(property.id);
                const isPicked = order >= 0;
                const full = !isPicked && picked.length >= max;
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      aria-pressed={isPicked}
                      disabled={full}
                      onClick={() => toggle(property.id)}
                      className={cn(
                        "group w-full overflow-hidden rounded-2xl border bg-card text-left outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45",
                        isPicked ? "border-foreground ring-2 ring-foreground" : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="relative block aspect-4/3 bg-muted">
                        {property.images[0] ? (
                          <Image src={property.images[0]} alt="" fill sizes="240px" className="object-cover" />
                        ) : (
                          <House className="m-auto h-full size-6 text-muted-foreground" aria-hidden />
                        )}
                        {isPicked && (
                          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                            {order + 1}
                          </span>
                        )}
                        {!isPicked && (
                          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full border border-white/70 bg-black/20 text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <Check className="size-3.5" aria-hidden />
                          </span>
                        )}
                      </span>
                      <span className="block p-3">
                        <span className="block truncate text-sm font-medium">{property.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatLocation(property.city, property.division)} · {listingPriceLabel(property)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(picked);
              onOpenChange(false);
            }}
          >
            Use {picked.length} {picked.length === 1 ? "property" : "properties"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
