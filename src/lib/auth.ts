import { decodeJwt } from "jose";
import { USER_ROLES, type JwtPayload, type UserRole } from "@/types";

// Server-safe helpers (also used by the route-protection proxy).

const ROLE_HOME: Record<UserRole, string> = {
  TENANT: "/dashboard/tenant",
  LANDLORD: "/dashboard/landlord",
  ADMIN: "/dashboard/admin",
};

export function roleHome(role: UserRole) {
  return ROLE_HOME[role];
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
