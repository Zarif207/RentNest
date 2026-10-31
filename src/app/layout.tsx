import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Jost } from "next/font/google";
import Script from "next/script";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { INTRO_GATE_SCRIPT } from "@/components/motion/intro-gate";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CONSENT_GATE_SCRIPT } from "@/lib/consent";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Headings, UI and body: a clean, tight grotesk like the design references.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Upright serif for accent phrases.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  // Secondary face (accents): don't compete with Geist for preload.
  preload: false,
});

// The "RentNest" wordmark only: it's in the navbar on every page, so it preloads.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: "500",
  display: "swap",
});

// Defaults for every page; public pages add their own title, description and
// canonical URL (lib/seo.ts), private ones opt out of indexing in their layouts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Rent or buy homes across the US`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Rent or buy homes across the US`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { title: SITE_NAME },
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
      className={`${geist.variable} ${cormorant.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Decides before first paint whether the intro overlay should show. */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {INTRO_GATE_SCRIPT}
        </Script>
        {/* Hides the cookie banner before first paint once a choice is saved. */}
        <Script id="consent-gate" strategy="beforeInteractive">
          {CONSENT_GATE_SCRIPT}
        </Script>
        <ThemeProvider>
          <QueryProvider>
            <MotionProvider>
              <AuthProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </AuthProvider>
              <Toaster position="top-center" closeButton />
              <CookieConsent />
            </MotionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
