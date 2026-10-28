"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Seed images are bare Unsplash URLs (multi-MB originals), which made the
 * built-in optimizer time out. Unsplash's CDN resizes on the fly, so we ask it
 * for the exact width instead. Other hosts (ImgBB uploads) have no resize
 * API and are served as-is; the `w` param only keeps srcset entries distinct.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  // Local files from /public are already sized; serve them directly.
  if (src.startsWith("/")) return src;

  const url = new URL(src);

  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", String(quality ?? 75));
  }

  url.searchParams.set("w", String(width));
  return url.toString();
}
