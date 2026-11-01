import {
  Building2,
  ClipboardList,
  CreditCard,
  HandCoins,
  Heart,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  PlusCircle,
  Star,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  TENANT: [
    { href: "/dashboard/tenant", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tenant/requests", label: "My Requests", icon: ClipboardList },
    { href: "/dashboard/tenant/offers", label: "Offers", icon: HandCoins },
    { href: "/dashboard/tenant/favorites", label: "Saved", icon: Heart },
    { href: "/dashboard/tenant/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/tenant/profile", label: "Profile", icon: UserRound },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/landlord/properties/new", label: "Add Property", icon: PlusCircle },
    { href: "/dashboard/landlord/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/landlord/offers", label: "Offers", icon: HandCoins },
    { href: "/dashboard/landlord/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/landlord/profile", label: "Profile", icon: UserRound },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/admin/rentals", label: "Rentals", icon: ClipboardList },
    { href: "/dashboard/admin/offers", label: "Offers", icon: HandCoins },
    { href: "/dashboard/admin/categories", label: "Categories", icon: Tags },
    { href: "/dashboard/admin/homepage", label: "Homepage", icon: LayoutTemplate },
    { href: "/dashboard/admin/profile", label: "Profile", icon: UserRound },
  ],
};

const ROLE_BY_SEGMENT: Record<string, UserRole> = {
  tenant: "TENANT",
  landlord: "LANDLORD",
  admin: "ADMIN",
};

/**
 * The dashboard role comes from the URL ("/dashboard/landlord/…"); the proxy
 * already guarantees it matches the signed-in user's role.
 */
export function dashboardRoleFromPath(pathname: string): UserRole | null {
  return ROLE_BY_SEGMENT[pathname.split("/")[2] ?? ""] ?? null;
}

/**
 * The nav item for the current page: the longest matching href wins, so
 * "/properties/new" highlights "Add Property", not "Properties".
 */
export function activeNavItem(items: DashboardNavItem[], pathname: string) {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/**
 * The nav item a notification link belongs to: the longest item whose path
 * the link's path equals or sits under ("/dashboard/tenant/requests/1/pay" →
 * My Requests; "/dashboard/admin/properties?review=PENDING" → Properties).
 * Overview is skipped: every link sits under it, and clearing it by prefix
 * would clear every section.
 */
export function navItemForLink(items: DashboardNavItem[], link: string) {
  const path = link.split(/[?#]/)[0];
  const overview = items[0]?.href;
  return items
    .filter((item) => item.href !== overview && (path === item.href || path.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** Unread notification counts per nav item href, from GET /notifications/summary. */
export function sectionCounts(items: DashboardNavItem[], byLink: { link: string; count: number }[] = []) {
  const counts = new Map<string, number>();
  for (const { link, count } of byLink) {
    const item = navItemForLink(items, link);
    if (item) counts.set(item.href, (counts.get(item.href) ?? 0) + count);
  }
  return counts;
}
