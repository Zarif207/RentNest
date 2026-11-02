import { decodeJwt } from "jose";
import { USER_ROLES, type JwtPayload, type UserRole } from "@/types";

// Server-safe helpers (also used by the route-protection proxy).

export const TOKEN_COOKIE = "rn_token";

const ROLE_HOME: Record<UserRole, string> = {
  TENANT: "/dashboard/tenant",
  LANDLORD: "/dashboard/landlord",
  ADMIN: "/dashboard/admin",
  // Read-only reviewer: lands on the admin dashboard.
  OBSERVER: "/dashboard/admin",
};

// The dashboards that exist, by the role that owns each one.
const DASHBOARD_OWNERS = ["TENANT", "LANDLORD", "ADMIN"] as const satisfies readonly UserRole[];

export function roleHome(role: UserRole) {
  return ROLE_HOME[role];
}

/** "/dashboard/admin/users" → "ADMIN"; null for "/dashboard" or unknown paths. */
export function dashboardOwner(pathname: string): UserRole | null {
  return (
    DASHBOARD_OWNERS.find((role) => {
      const home = ROLE_HOME[role];
      return pathname === home || pathname.startsWith(`${home}/`);
    }) ?? null
  );
}

/**
 * Whether a role may open a dashboard path. Observers may view the admin and
 * landlord dashboards (the API lets them read, never write).
 */
export function canOpenDashboard(role: UserRole, pathname: string) {
  const owner = dashboardOwner(pathname);
  if (!owner) return false;
  return owner === role || (role === "OBSERVER" && (owner === "ADMIN" || owner === "LANDLORD"));
}

/**
 * Validates a `?redirect=` value: same-site paths only (no "//host" or
 * "https://…"), and never back into /auth.
 */
export function safeRedirect(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return null;
  }
  return path.startsWith("/auth") ? null : path;
}

/**
 * Where to go after signing in: the ?redirect= path when this role may open
 * it, else the role's dashboard. Another role's dashboard would make the proxy
 * redirect the client navigation, and redirected RSC requests 404.
 */
export function afterSignIn(redirectTo: string | null, role: UserRole) {
  if (!redirectTo) return roleHome(role);
  const isDashboard = redirectTo === "/dashboard" || redirectTo.startsWith("/dashboard/");
  return !isDashboard || canOpenDashboard(role, redirectTo) ? redirectTo : roleHome(role);
}

function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

/**
 * Reads the JWT payload without verifying the signature (there is no secret
 * on the frontend). Only for UI decisions; the backend verifies every request.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = decodeJwt(token);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      !isUserRole(payload.role) ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat ?? 0,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload) {
  return payload.exp * 1000 <= Date.now();
}
