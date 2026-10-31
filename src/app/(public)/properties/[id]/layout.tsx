import { notFound } from "next/navigation";
import { getPublicProperty } from "@/lib/data/public";
import { isUuid } from "@/lib/utils";

/**
 * Checks the listing exists outside this segment's loading.tsx, so a missing
 * listing renders the 404 page instead of a skeleton. Malformed ids never get
 * here (the proxy 404s them); a first request for a well-formed missing id
 * gets the route's 200 shell, and later ones the cached 404. The lookup is
 * cached, so the page reuses it.
 */
export default async function PropertyLayout({ children, params }: LayoutProps<"/properties/[id]">) {
  const { id } = await params;
  if (!isUuid(id) || !(await getPublicProperty(id))) notFound();
  return children;
}
