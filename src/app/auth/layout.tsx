import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthMobileHeader, AuthShowcase } from "@/components/auth/auth-showcase";
import { AuthStats } from "@/components/auth/auth-stats";
import { ThemeToggle } from "@/components/shared/theme-toggle";

// Sign-in and registration are private: keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Split screen: a photo panel per page (desktop, sticky) beside the form.
 * On small screens the photo becomes a compact header on top.
 */
export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <AuthShowcase
        stats={
          <Suspense fallback={null}>
            <AuthStats />
          </Suspense>
        }
      />

      <div className="flex min-w-0 flex-col">
        <AuthMobileHeader />

        <header className="hidden items-center justify-end px-10 pt-6 lg:flex">
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-12 sm:px-10 lg:py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
