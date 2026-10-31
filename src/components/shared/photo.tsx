"use client";

import Image, { type ImageProps } from "next/image";
import { canOptimize, isUnsplash, unsplashLoader } from "@/lib/image-loader";

/**
 * next/image with the right loader for each host (see lib/image-loader):
 * Unsplash's own CDN, Next's optimizer for known hosts, as-is for the rest.
 * Import it as `Image`; it takes the same props.
 */
export default function Photo({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  if (src && isUnsplash(src)) return <Image alt={alt} loader={unsplashLoader} {...props} />;
  if (src && !canOptimize(src)) return <Image alt={alt} unoptimized {...props} />;
  return <Image alt={alt} {...props} />;
}
