import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import Script from "next/script";
import { INTRO_GATE_SCRIPT } from "@/components/motion/intro-gate";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Headings, UI and body: a clean, tight grotesk like the design references.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Upright serif for accent phrases; the italic is only for the logo wordmark.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  // Secondary face (accents, wordmark): don't compete with Geist for preload.
  preload: false,
});

const description =
  "RentNest is a rental marketplace connecting tenants with landlords.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RentNest — Find. Request. Move in.",
    template: "%s · RentNest",
  },
  description,
  openGraph: {
    siteName: "RentNest",
    title: "RentNest — Find. Request. Move in.",
    description,
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Decides before first paint whether the intro overlay should show. */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {INTRO_GATE_SCRIPT}
        </Script>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </AuthProvider>
            <Toaster position="top-center" closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
