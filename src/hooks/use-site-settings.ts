"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { propertiesService } from "@/lib/api/properties";
import { siteSettingsService } from "@/lib/api/site-settings";
import { queryKeys } from "@/lib/query-keys";
import type { HomepageConfig } from "@/types";

/** The raw homepage config for the admin editor. */
export function useHomepageConfig() {
  return useQuery({
    queryKey: queryKeys.admin.homepage,
    queryFn: siteSettingsService.getHomepageConfig,
  });
}

/** Every state that has listings, with counts (public). */
export function usePropertyStates() {
  return useQuery({
    queryKey: queryKeys.propertyStates,
    queryFn: () => propertiesService.getStates(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Asks the Next server to drop its cached homepage (checks the admin token). */
async function refreshHomepage() {
  const response = await fetch("/api/revalidate-home", { method: "POST" });
  if (!response.ok) throw new Error("revalidate failed");
}

// Editor panel names for the config's top-level keys, used in error toasts.
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero mosaic",
  featured: "Featured collection",
  states: "States",
  propertyTypes: "Property types",
  latest: "Latest listings",
  sectionOrder: "Section order",
};

/** "Validation failed" alone doesn't say what to fix; list each problem by panel. */
function describeSaveError(error: unknown) {
  if (!isApiError(error) || error.errorDetails.length === 0) return undefined;
  return error.errorDetails
    .map(({ path, message }) => `${SECTION_LABELS[path.split(".")[0]] ?? path}: ${message}`)
    .join(" · ");
}

/** Saves the homepage config, then refreshes the public homepage right away. */
export function useSaveHomepageConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: HomepageConfig) => siteSettingsService.saveHomepageConfig(config),
    onSuccess: async (saved) => {
      queryClient.setQueryData(queryKeys.admin.homepage, saved);
      try {
        await refreshHomepage();
        toast.success("Homepage saved", { description: "The changes are live on the homepage." });
      } catch {
        toast.success("Homepage saved", { description: "It can take up to a minute to show on the homepage." });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error), { description: describeSaveError(error) }),
  });
}
