"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Small search box on the 404 page that jumps to /properties. */
export function NotFoundSearch() {
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("q")?.toString().trim();
    router.push(term ? `/properties?searchTerm=${encodeURIComponent(term)}` : "/properties");
  };

  return (
    <form onSubmit={onSubmit} role="search" className="mt-8 flex w-full max-w-sm gap-2">
      <label htmlFor="not-found-search" className="sr-only">
        Search homes
      </label>
      <Input id="not-found-search" name="q" placeholder="Search a city or neighborhood" className="rounded-full" />
      <Button type="submit" size="icon" aria-label="Search" className="shrink-0">
        <Search />
      </Button>
    </form>
  );
}
