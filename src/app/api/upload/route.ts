import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeToken, isTokenExpired, TOKEN_COOKIE } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/uploads";

// Proxies image uploads to ImgBB so IMGBB_API_KEY never reaches the browser.
// Responses: 200 { url } or { success: false, message } with a fitting status.

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

type ImgbbResponse = {
  success?: boolean;
  data?: { url?: string; display_url?: string };
  error?: { message?: string };
};

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  // Only signed-in landlords/admins add listing photos. The token is decoded,
  // not verified (no secret here); it keeps the key from being an open proxy.
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const session = token ? decodeToken(token) : null;
  if (!session || isTokenExpired(session)) {
    return fail(401, "Please log in to upload images.");
  }
  if (session.role !== "LANDLORD" && session.role !== "ADMIN") {
    return fail(403, "Only landlords can upload property photos.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Send the image as multipart form data.");
  }

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return fail(400, "No image file was provided.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return fail(415, "Only JPEG, PNG or WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return fail(413, "Images must be 5 MB or smaller.");
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return fail(503, "Image uploads aren't configured yet. Paste an image URL instead.");
  }

  const upstream = new FormData();
  upstream.append("image", file);

  let result: ImgbbResponse | null = null;
  try {
    const response = await fetch(`${IMGBB_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: upstream,
      signal: AbortSignal.timeout(30_000),
    });
    result = (await response.json().catch(() => null)) as ImgbbResponse | null;
    if (!response.ok || !result?.success) {
      console.error("ImgBB upload failed", response.status, result?.error?.message);
      return fail(502, "The image host rejected the upload. Please try another image.");
    }
  } catch (error) {
    console.error("ImgBB upload error", error);
    return fail(504, "The image host didn't respond. Please try again.");
  }

  const url = result.data?.display_url ?? result.data?.url;
  if (!url) {
    return fail(502, "The image host didn't return a link. Please try again.");
  }

  return NextResponse.json({ url });
}
