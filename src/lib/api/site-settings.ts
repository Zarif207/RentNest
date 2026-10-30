import type { HomepageConfig, HomepageConfigResponse, HomepageSettings } from "@/types";
import { api } from "./client";

export const siteSettingsService = {
  /**
   * Public: the homepage config resolved for rendering. The backend sends a
   * 60 s CDN cache header; the unique `fresh` param skips that CDN copy so a
   * just-saved config shows at once (Next's own cache still limits calls).
   */
  getHomepage: () =>
    api.get<HomepageSettings>("/site-settings/homepage", { query: { fresh: Date.now() } }),

  // Admin only
  getHomepageConfig: () => api.get<HomepageConfigResponse>("/admin/site-settings/homepage"),

  saveHomepageConfig: (config: HomepageConfig) =>
    api.put<HomepageConfigResponse>("/admin/site-settings/homepage", config),
};
