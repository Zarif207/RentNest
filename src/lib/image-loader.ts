import type { ImageLoaderProps } from "next/image";

/**
 * Photo hosts that Next's image optimizer may fetch (next.config's
 * remotePatterns): it resizes them and serves AVIF or WebP. Unsplash isn't
 * one of them: seed photos are bare Unsplash URLs (multi-MB originals that
 * made the optimizer time out), and Unsplash's CDN resizes on the fly, so
 * those go straight to it. Any other host is shown as-is.
 */
export const OPTIMIZED_IMAGE_HOSTS = ["i.ibb.co", "ap.rdcpix.com", "ar.rdcpix.com", "images.openai.com"];

function hostOf(src: string) {
  try {
    return new URL(src).hostname;
  } catch {
    return null;
  }
}

export const isUnsplash = (src: string) => hostOf(src) === "images.unsplash.com";

/** Local files from /public and the hosts above. */
export function canOptimize(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || OPTIMIZED_IMAGE_HOSTS.includes(hostOf(src) ?? "");
}

/** Asks Unsplash's CDN for the exact width, in the browser's best format. */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("w", String(width));
  return url.toString();
}

/** A sized URL for a plain <img> (Leaflet popups). `width` must be one of next.config's image sizes. */
export function photoUrl(src: string, width: number) {
  if (isUnsplash(src)) return unsplashLoader({ src, width });
  if (canOptimize(src)) return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
  return src;
}
