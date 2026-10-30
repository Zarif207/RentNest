import type { HomepageSettings } from "@/types";
import { api } from "./client";

export const siteSettingsService = {
  /** Public: the homepage config resolved for rendering. */
  getHomepage: () => api.get<HomepageSettings>("/site-settings/homepage"),
};
