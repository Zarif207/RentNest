import {
  Building2,
  ClipboardList,
  CreditCard,
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
    { href: "/dashboard/tenant/favorites", label: "Saved", icon: Heart },
    { href: "/dashboard/tenant/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/tenant/profile", label: "Profile", icon: UserRound },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/landlord/properties/new", label: "Add Property", icon: PlusCircle },
    { href: "/dashboard/landlord/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/landlord/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/landlord/profile", label: "Profile", icon: UserRound },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/admin/rentals", label: "Rentals", icon: ClipboardList },
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
