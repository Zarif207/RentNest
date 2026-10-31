import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Public pages are open to crawlers; accounts, payments and the API aren't. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/auth", "/api", "/payment"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
