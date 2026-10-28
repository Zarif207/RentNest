"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, DollarSign, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { PROPERTY_TYPES } from "@/types";

const ANY = "any";
const MAX_PRICES = [1000, 2000, 3000, 5000, 10000];

// Borderless triggers: the pill itself is the field.
const fieldClass =
  "h-12 w-full border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent";

/** Floating pill search; sends the user to /properties with the filters in the URL. */
export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState(ANY);
  const [maxPrice, setMaxPrice] = useState(ANY);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("searchTerm", location.trim());
    if (propertyType !== ANY) params.set("propertyType", propertyType);
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="grid gap-1 rounded-3xl border bg-background p-3 shadow-2xl shadow-black/10 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-0 md:rounded-full md:p-2 md:pl-6"
    >
      <label className="flex items-center gap-3 rounded-2xl px-3 md:px-0 md:pr-4">
        <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Location</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City, neighborhood or address"
          className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="flex items-center gap-3 border-t px-3 md:border-t-0 md:border-l md:px-4">
        <Building2 className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger aria-label="Property type" className={fieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any type</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {formatEnumLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 border-t px-3 md:border-t-0 md:border-l md:px-4">
        <DollarSign className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <Select value={maxPrice} onValueChange={setMaxPrice}>
          <SelectTrigger aria-label="Maximum monthly rent" className={fieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any price</SelectItem>
            {MAX_PRICES.map((price) => (
              <SelectItem key={price} value={String(price)}>
                Up to {formatCurrency(price)}/mo
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" className="mt-2 h-14 px-7 md:mt-0">
        <Search data-icon="inline-start" /> Find Property
      </Button>
    </form>
  );
}
