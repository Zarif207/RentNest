import { roleHome } from "@/lib/auth";
import type { UserRole } from "@/types";

export type NavLink = {
  href: string;
  label: string;
};

/** Left of the navbar's roof peak. */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/rent", label: "Rent" },
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
];

/** Right of the peak (inside "More" between 1024 and 1279 px). */
export const SECONDARY_NAV_LINKS: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Role shortcut for signed-in tenants and landlords, shown in the account menus. */
export function roleShortcut(role: UserRole): NavLink | null {
  if (role === "LANDLORD") {
    return { href: "/dashboard/landlord/properties/new", label: "List a property" };
  }
  if (role === "TENANT") {
    return { href: "/dashboard/tenant/requests", label: "My requests" };
  }
  return null;
}

export function profilePath(role: UserRole) {
  return `${roleHome(role)}/profile`;
}

export function isActiveLink(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
