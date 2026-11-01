import { createElement } from "react";
import { categoryIcon } from "@/lib/property-taxonomy";

/** The icon for a category, picked from its name. */
export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(categoryIcon(name), { className, "aria-hidden": true });
}
