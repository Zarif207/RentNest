import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/layout/site-header";
import { IntroGate } from "@/components/motion/intro-gate";
import { IntroPreloader } from "@/components/motion/intro-preloader";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

// Smooth scrolling and the intro live here, so dashboards keep native scroll.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScrollProvider>
      <IntroGate />
      <IntroPreloader />
      <div className="flex min-h-svh flex-col">
        {/* The header reads the pathname; on dynamic routes that needs a boundary. */}
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        {/* Room for the fixed header pill. Pages whose hero runs under the
            header mark it data-full-bleed, and CSS hides this from the first
            paint (no shift when the header hydrates). */}
        <div aria-hidden className="h-24 [body:has([data-full-bleed])_&]:hidden" />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </SmoothScrollProvider>
  );
}
