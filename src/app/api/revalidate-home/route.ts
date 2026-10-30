import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";
import { HOMEPAGE_TAG } from "@/lib/data/public";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

/**
 * Called by the admin homepage editor after a save: drops the cached homepage
 * so the change is visible immediately. The token is checked with the backend
 * (GET /auth/me), so only a real, active admin can trigger it.
 */
export async function POST() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token || !API_URL) {
    return NextResponse.json({ success: false, message: "Please log in." }, { status: 401 });
  }

  const me = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  const body = (await me?.json().catch(() => null)) as { data?: { role?: string } } | null;

  if (!me?.ok || body?.data?.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Only admins can refresh the homepage." }, { status: 403 });
  }

  // Route handlers can't use updateTag; { expire: 0 } expires it immediately.
  revalidateTag(HOMEPAGE_TAG, { expire: 0 });
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
