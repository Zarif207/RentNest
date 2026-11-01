import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/lib/image-loader";

// Sent with every response. No script CSP: Next's inline scripts would need
// per-request nonces, which would make every static page dynamic. This one
// only stops framing (clickjacking), <base> hijacking and plugins.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

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
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
