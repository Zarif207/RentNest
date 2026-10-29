import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NotFoundSearch } from "@/components/shared/not-found-search";
import { NotFoundState } from "@/components/shared/not-found-state";
import { SerifAccent } from "@/components/shared/serif-accent";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = { title: "Page not found" };

// Unmatched URLs anywhere in the app land here (inside the root layout only).
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-linear-to-b from-wash-from to-wash-to">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center">
        <NotFoundState
          title={
            <>
              This home isn&apos;t <SerifAccent>on the market</SerifAccent>
            </>
          }
          description="The page you're looking for doesn't exist or has moved. Try a search instead."
        >
          <NotFoundSearch />
        </NotFoundState>
      </main>
    </div>
  );
}
