import { NextResponse, type NextRequest } from "next/server";
import { decodeToken, isTokenExpired, roleHome, TOKEN_COOKIE } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/types";

/**
 * Route protection (Next 16 "proxy", formerly middleware).
 *
 * This is an optimistic, UX-level check: the token is only decoded, not
 * verified, because the JWT secret lives on the backend. A forged or edited
 * token can get past these redirects, but every API call still sends the
 * token to the backend, which verifies the signature, expiry, blocked status
 * and role before returning any data.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  const session = payload && !isTokenExpired(payload) ? payload : null;

  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    // Drop an expired or unreadable cookie so the client doesn't reuse it.
    if (token && !session) response.cookies.delete(TOKEN_COOKIE);
    return response;
  };

  if (pathname.startsWith("/auth")) {
    return session ? redirectTo(roleHome(session.role)) : NextResponse.next();
  }

  // Everything below is /dashboard/**.
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return redirectTo(loginUrl.pathname + loginUrl.search);
  }

  const requiredRole = dashboardRole(pathname);

  if (!requiredRole || requiredRole !== session.role) {
    // "/dashboard" itself, or another role's dashboard: go to your own.
    return redirectTo(roleHome(session.role));
  }

  return NextResponse.next();
}

/** "/dashboard/admin/users" → "ADMIN"; null for "/dashboard" or unknown segments. */
function dashboardRole(pathname: string): UserRole | null {
  return (
    USER_ROLES.find((role) => {
      const home = roleHome(role);
      return pathname === home || pathname.startsWith(`${home}/`);
    }) ?? null
  );
}

// Only the protected and auth routes run the proxy, so static files,
// /_next assets, images and /api route handlers never reach it.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/auth/:path*"],
};
