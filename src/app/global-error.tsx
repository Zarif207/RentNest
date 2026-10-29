"use client";

import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

// Replaces the root layout when it crashes, so it brings its own document,
// styles and font, and uses no providers. Follows the OS color scheme.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="grid min-h-svh place-items-center bg-background px-4 text-foreground dark:bg-[#0c0b0a] dark:text-[#f2eee7]">
        <title>Something went wrong · RentNest</title>
        <main className="flex max-w-md flex-col items-center text-center">
          <p className="text-sm font-medium tracking-[0.3em] uppercase">RentNest</p>
          <h1 className="mt-8 text-4xl font-medium tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">
            The app hit an unexpected problem. Please try again. If it keeps happening, come back in a
            few minutes.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="h-10 rounded-full bg-[#12100e] px-5 text-sm font-medium text-[#f6f3ee] dark:bg-[#c2a878] dark:text-[#12100e]"
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
