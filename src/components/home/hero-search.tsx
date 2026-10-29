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

export type HeroCity = { value: string; label: string };

// Borderless, light-on-glass triggers: the panel itself frames the fields.
const fieldClass =
  "h-12 w-full border-0 bg-transparent px-0 text-base text-white shadow-none hover:border-0 focus-visible:ring-0 data-placeholder:text-white/70 dark:bg-transparent [&_svg]:text-white/70";

/**
 * Glass search panel over the hero image. Cities come from real listings;
 * submitting opens /properties with the filters in the URL.
 */
export function HeroSearch({ cities }: { cities: HeroCity[] }) {
  const router = useRouter();
  const [city, setCity] = useState(ANY);
  const [propertyType, setPropertyType] = useState(ANY);
  const [maxPrice, setMaxPrice] = useState(ANY);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city !== ANY) params.set("city", city);
    if (propertyType !== ANY) params.set("propertyType", propertyType);
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search homes"
      className="grid gap-1 rounded-[1.75rem] border border-white/15 bg-white/10 p-2 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center md:gap-0 md:rounded-full md:pl-6"
    >
      <div className="flex items-center gap-3 px-3 md:px-0 md:pr-4">
        <MapPin className="size-5 shrink-0 text-white/70" aria-hidden />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger aria-label="City" className={fieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any city</SelectItem>
            {cities.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 border-t border-white/15 px-3 md:border-t-0 md:border-l md:px-4">
        <Building2 className="size-5 shrink-0 text-white/70" aria-hidden />
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

      <div className="flex items-center gap-3 border-t border-white/15 px-3 md:border-t-0 md:border-l md:px-4">
        <DollarSign className="size-5 shrink-0 text-white/70" aria-hidden />
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

      <Button type="submit" variant="gold" size="lg" className="mt-2 h-13 px-7 md:mt-0">
        <Search data-icon="inline-start" /> Search homes
      </Button>
    </form>
  );
}
