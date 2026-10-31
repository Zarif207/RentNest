import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/lib/image-loader";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Unsplash photos skip the optimizer (components/shared/photo.tsx).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
  partialPrefetching: true,
  // Import only the Radix primitives in use from the unified package
  // (lucide-react and date-fns are on Next's default list already).
  experimental: { optimizePackageImports: ["radix-ui"] },
  // Old links that filtered /properties by listing type go to the type's own page.
  async redirects() {
    return [
      {
        source: "/properties",
        has: [{ type: "query", key: "listingType", value: "SALE" }],
        destination: "/buy",
        permanent: true,
      },
      {
        source: "/properties",
        has: [{ type: "query", key: "listingType", value: "RENT" }],
        destination: "/rent",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
