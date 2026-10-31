"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, DollarSign, Map as MapIcon, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatEnumLabel } from "@/lib/format";
import { matchUsState } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPES } from "@/types";

const ANY = "any";
const MAX_PRICES = [1000, 2000, 3000, 5000, 10000];
const MAX_SUGGESTIONS = 6;

/** A place to search for, built on the server from real listings. */
export type HeroSuggestion =
  | { kind: "state"; state: string; count: number }
  | { kind: "city"; city: string; state: string; label: string; count: number };

// Borderless, light-on-glass fields: the panel itself frames them.
const fieldClass =
  "h-12 w-full border-0 bg-transparent px-0 text-base text-white shadow-none hover:border-0 focus-visible:ring-0 data-placeholder:text-white/70 dark:bg-transparent [&_svg]:text-white/70";

/** "new york", "NY" → "New York"; anything else → null. */
const suggestionLabel = (suggestion: HeroSuggestion) =>
  suggestion.kind === "state" ? suggestion.state : suggestion.label;

/** Prefix matches first ("new" → New York before Newark-like substrings), then the rest. */
function filterSuggestions(suggestions: HeroSuggestion[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return suggestions.slice(0, MAX_SUGGESTIONS);
  const scored = suggestions
    .map((suggestion) => {
      const text = suggestionLabel(suggestion).toLowerCase();
      const words = text.split(/[\s,]+/);
      const score = text.startsWith(q) ? 0 : words.some((word) => word.startsWith(q)) ? 1 : text.includes(q) ? 2 : 3;
      return { suggestion, score };
    })
    .filter((item) => item.score < 3);
  return scored
    .sort((a, b) => a.score - b.score || b.suggestion.count - a.suggestion.count)
    .slice(0, MAX_SUGGESTIONS)
    .map((item) => item.suggestion);
}

/**
 * Glass search panel over the hero image. The location field is a text
 * combobox with suggestions from real states and cities (keyboard: ↑ ↓ Enter
 * Esc). Submitting opens /properties: a state (typed or picked) filters by
 * `division`, a picked city by `city`, and any other text by `searchTerm`.
 */
export function HeroSearch({ suggestions }: { suggestions: HeroSuggestion[] }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-places`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<HeroSuggestion | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [propertyType, setPropertyType] = useState(ANY);
  const [maxPrice, setMaxPrice] = useState(ANY);

  const matches = useMemo(() => filterSuggestions(suggestions, query), [suggestions, query]);
  const showList = open && matches.length > 0;

  const choose = (suggestion: HeroSuggestion) => {
    setPicked(suggestion);
    setQuery(suggestionLabel(suggestion));
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % Math.max(matches.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index <= 0 ? matches.length - 1 : index - 1));
    } else if (event.key === "Enter" && showList && active >= 0) {
      // Enter on a highlighted suggestion picks it instead of submitting.
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape" && showList) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const text = query.trim();

    if (picked && suggestionLabel(picked) === text) {
      if (picked.kind === "state") params.set("division", picked.state);
      else {
        params.set("city", picked.city);
        params.set("division", picked.state);
      }
    } else if (text) {
      const state = matchUsState(text);
      params.set(state ? "division" : "searchTerm", state ?? text);
    }
    if (propertyType !== ANY) params.set("propertyType", propertyType);
    if (maxPrice !== ANY) params.set("maxPrice", maxPrice);

    setOpen(false);
    const search = params.toString();
    router.push(search ? `/properties?${search}` : "/properties");
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search homes"
      className="grid gap-1 rounded-[1.75rem] border border-white/15 bg-white/10 p-2 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center md:gap-0 md:rounded-full md:pl-6"
    >
      <div className="relative flex items-center gap-3 px-3 md:px-0 md:pr-4">
        <MapPin className="size-5 shrink-0 text-white/70" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="City or state"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="City or state…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPicked(null);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          // Let a click on a suggestion land before the list closes.
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="h-12 w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-white/70"
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Suggested places"
            // Opens upward: the panel sits at the bottom of the hero, which clips overflow.
            className="absolute bottom-full left-0 z-30 mb-3 w-full min-w-64 overflow-hidden rounded-2xl border border-white/15 bg-[#1c1815] p-1.5 text-white shadow-2xl shadow-black/40 md:-left-4"
          >
            {matches.map((suggestion, index) => {
              const Icon = suggestion.kind === "state" ? MapIcon : MapPin;
              return (
                <li
                  key={`${suggestion.kind}-${suggestionLabel(suggestion)}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown (not click) so the input doesn't blur first.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(suggestion);
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                    index === active ? "bg-white/12" : "hover:bg-white/8",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-gold" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{suggestionLabel(suggestion)}</span>
                  <span className="shrink-0 text-xs text-white/55">
                    {suggestion.kind === "state" ? "State" : "City"} · {suggestion.count}{" "}
                    {suggestion.count === 1 ? "home" : "homes"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
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
