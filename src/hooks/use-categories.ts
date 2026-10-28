"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesService.getAll,
    staleTime: 5 * 60_000,
  });
}
