"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { matchUsState } from "@/lib/us-states";
import { cn } from "@/lib/utils";

/**
 * Navbar search: a magnifier that opens a small field. Like the hero search,
 * a US state ("Texas" or "TX") filters by state and anything else is a text
 * search, on /properties.
 */
export function NavSearch({
  className,
  onOpenChange,
}: {
  className?: string;
  /** Lets the navbar stay on screen while the field is open. */
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [open, setOpenState] = useState(false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const [query, setQuery] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = query.trim();
    const state = matchUsState(text);
    const params = new URLSearchParams(text ? { [state ? "division" : "searchTerm"]: state ?? text } : {});
    const search = params.toString();
    setOpen(false);
    setQuery("");
    router.push(search ? `/properties?${search}` : "/properties");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open search" className={cn("rounded-full", className)}>
          <Search />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={12} className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-2">
        <form role="search" onSubmit={onSubmit} className="flex items-center gap-2">
          <label htmlFor="nav-search" className="sr-only">
            Search homes
          </label>
          <Input
            id="nav-search"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City, state or home name"
            className="h-10 flex-1 rounded-full"
          />
          <Button type="submit" variant="gold" className="h-10 rounded-full px-4">
            Search
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
