import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
  partialPrefetching: true,
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
