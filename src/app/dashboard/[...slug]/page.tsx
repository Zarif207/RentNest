import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Page not found" };

// Unknown /dashboard/** URLs render dashboard/not-found.tsx inside the
// dashboard layout (sidebar included) instead of the bare root 404.
export default function UnknownDashboardPage() {
  notFound();
}
