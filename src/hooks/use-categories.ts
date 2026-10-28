"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPublicCategories } from "@/app/actions/categories";
import { adminService } from "@/lib/api/admin";
import { categoriesService } from "@/lib/api/categories";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Category, CategoryInput } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesService.getAll,
    staleTime: 5 * 60_000,
  });
}

/**
 * How many listings use each category (meta.total of a limit=1 admin query),
 * so the UI can explain why a category can't be deleted.
 */
export function useCategoryUsage(categories: Category[]) {
  const results = useQueries({
    queries: categories.map((category) => ({
      queryKey: queryKeys.admin.properties.list({ categoryId: category.id, limit: 1 }),
      queryFn: () => adminService.getProperties({ categoryId: category.id, limit: 1 }),
    })),
  });
  return new Map(categories.map((category, index) => [category.id, results[index]?.data?.meta.total]));
}

function useAfterCategoryChange() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.properties.all });
    void refreshPublicCategories();
  };
}

export function useCreateCategory() {
  const afterChange = useAfterCategoryChange();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoriesService.create(input),
    onSuccess: (category) => {
      afterChange();
      toast.success(`Category “${category.name}” created`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRenameCategory() {
  const afterChange = useAfterCategoryChange();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => categoriesService.update(id, input),
    onSuccess: (category) => {
      afterChange();
      toast.success(`Renamed to “${category.name}”`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const afterChange = useAfterCategoryChange();
  return useMutation({
    mutationFn: (category: Category) => categoriesService.remove(category.id),
    onSuccess: (_result, category) => {
      afterChange();
      toast.success(`Category “${category.name}” deleted`);
    },
    onError: (error) =>
      // 400: the backend refuses to delete a category that listings still use.
      toast.error(
        isApiError(error) && error.status === 400
          ? "This category is still used by properties, so it can't be deleted. Move those listings to another category first."
          : getErrorMessage(error),
      ),
  });
}
