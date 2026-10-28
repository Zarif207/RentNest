"use client";

import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readFilters, type BrowseFilters } from "@/lib/property-filters";

type ParamUpdates = Record<string, string | null>;

type BrowseContextValue = {
  filters: BrowseFilters;
  /** True while a filter change is loading; the results dim meanwhile. */
  isPending: boolean;
  /** Sets (or, with null/"", removes) URL params. Any change resets to page 1. */
  setParams: (updates: ParamUpdates) => void;
  clearAll: () => void;
};

const BrowseContext = createContext<BrowseContextValue | null>(null);

export function BrowseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => readFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      // push (not replace) so the back button restores the previous filters.
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setParams = useCallback(
    (updates: ParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (!("page" in updates)) params.delete("page");
      navigate(params);
    },
    [navigate, searchParams],
  );

  const clearAll = useCallback(() => {
    // Keep the chosen sort order; drop every filter.
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    navigate(params);
  }, [navigate, searchParams]);

  const value = useMemo(
    () => ({ filters, isPending, setParams, clearAll }),
    [filters, isPending, setParams, clearAll],
  );

  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>;
}

export function useBrowse() {
  const context = useContext(BrowseContext);
  if (!context) throw new Error("useBrowse must be used inside <BrowseProvider>");
  return context;
}
