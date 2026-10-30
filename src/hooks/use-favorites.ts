"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { favoritesService } from "@/lib/api/favorites";
import { queryKeys } from "@/lib/query-keys";
import type { FavoriteWithProperty, Paginated } from "@/types";

export const SAVED_HOMES_PATH = "/dashboard/tenant/favorites";

/** Only tenants can save homes; everyone else gets no hearts. */
function useIsTenant() {
  const { user } = useAuth();
  return user?.role === "TENANT";
}

/** Saved property ids (fills the hearts). Fetched once per session for tenants. */
export function useFavoriteIds() {
  const isTenant = useIsTenant();
  return useQuery({
    queryKey: queryKeys.favorites.ids,
    queryFn: favoritesService.getIds,
    enabled: isTenant,
    staleTime: 5 * 60_000,
  });
}

/** The Saved homes page: saved properties, newest first. */
export function useMyFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites.list,
    queryFn: favoritesService.getMine,
  });
}

type ToggleInput = { propertyId: string; save: boolean };

/**
 * Saves or removes a home. Optimistic: the heart (and the Saved homes list,
 * on removal) update at once and roll back if the request fails.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, save }: ToggleInput) => {
      if (save) await favoritesService.add(propertyId);
      else await favoritesService.remove(propertyId);
    },
    onMutate: async ({ propertyId, save }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all });
      const previousIds = queryClient.getQueryData<string[]>(queryKeys.favorites.ids);
      const previousList = queryClient.getQueryData<Paginated<FavoriteWithProperty>>(queryKeys.favorites.list);

      queryClient.setQueryData<string[]>(queryKeys.favorites.ids, (ids = []) =>
        save ? [propertyId, ...ids.filter((id) => id !== propertyId)] : ids.filter((id) => id !== propertyId),
      );
      if (!save && previousList) {
        queryClient.setQueryData<Paginated<FavoriteWithProperty>>(queryKeys.favorites.list, {
          ...previousList,
          data: previousList.data.filter((favorite) => favorite.propertyId !== propertyId),
          meta: { ...previousList.meta, total: Math.max(0, previousList.meta.total - 1) },
        });
      }
      return { previousIds, previousList };
    },
    onSuccess: (_data, { save }) => toast.success(save ? "Saved to your favorites" : "Removed from your favorites"),
    onError: (error, _input, context) => {
      queryClient.setQueryData(queryKeys.favorites.ids, context?.previousIds);
      queryClient.setQueryData(queryKeys.favorites.list, context?.previousList);
      toast.error(getErrorMessage(error));
    },
    // The list needs the new home's details, so refetch it after a save.
    onSettled: (_data, _error, { save }) => {
      if (save) void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list });
    },
  });
}
