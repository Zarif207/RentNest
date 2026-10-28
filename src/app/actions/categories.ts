"use server";

import { updateTag } from "next/cache";
import { CATEGORIES_TAG, PROPERTIES_TAG } from "@/lib/data/public";

/**
 * Expires cached categories (and listings, which show the category name) so
 * an admin's create/rename/delete shows on public pages right away.
 */
export async function refreshPublicCategories() {
  updateTag(CATEGORIES_TAG);
  updateTag(PROPERTIES_TAG);
}
