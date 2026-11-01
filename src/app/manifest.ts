import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/** Web app manifest: name, colors and the birds-and-egg nest icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Rent or buy homes across the US`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ee",
    theme_color: "#12100e",
    icons: [
      { src: "/icon/32", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
