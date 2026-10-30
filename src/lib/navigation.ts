import { roleHome } from "@/lib/auth";
import type { UserRole } from "@/types";

export type NavLink = {
  href: string;
  label: string;
};

// Contact is a section, not a page: the contact details in the footer
// (present on every public page).
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/** Shortcut shown next to the main links for signed-in tenants and landlords. */
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
