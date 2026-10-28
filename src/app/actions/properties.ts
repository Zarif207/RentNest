"use server";

import { updateTag } from "next/cache";
import { PROPERTIES_TAG } from "@/lib/data/public";

/**
 * Expires the cached public listings (home, /properties, details) so a
 * landlord's create/edit/delete shows up immediately. It only clears cache
 * entries, so it's safe to expose.
 */
export async function refreshPublicListings() {
  updateTag(PROPERTIES_TAG);
}
