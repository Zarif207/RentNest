import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/categories-view";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return <CategoriesView />;
}
