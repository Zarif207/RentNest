"use client";

import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

// Replaces the root layout when it crashes, so it brings its own document,
// styles and font, and uses no providers. Follows the OS color scheme.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="grid min-h-svh place-items-center bg-background px-4 text-foreground dark:bg-[#0e0e0f] dark:text-[#f5f5f5]">
        <title>Something went wrong · RentNest</title>
        <main className="flex max-w-md flex-col items-center text-center">
          <p className="text-lg font-semibold tracking-tight">RentNest</p>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">
            The app hit an unexpected problem. Please try again. If it keeps happening, come back in a
            few minutes.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="h-10 rounded-full bg-[#171717] px-5 text-sm font-medium text-white dark:bg-[#f5f5f5] dark:text-[#171717]"
            >
              Try again
            </button>
            {/* A plain link: client navigation isn't available once the root layout has failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium">
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
