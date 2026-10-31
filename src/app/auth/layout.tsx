import type { Metadata } from "next";
import Image from "next/image";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SerifAccent } from "@/components/shared/serif-accent";
import { ThemeToggle } from "@/components/shared/theme-toggle";

// Sign-in and registration are private: keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const AUTH_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811";

/** The photo with its slow Ken Burns push-in (stopped under reduced motion). */
function KenBurnsImage({ sizes }: { sizes: string }) {
  return (
    <Image
      src={AUTH_IMAGE}
      alt="Modern villa with a pool at dusk"
      fill
      preload
      sizes={sizes}
      className="object-cover motion-safe:animate-[ken-burns_24s_ease-out_infinite_alternate]"
    />
  );
}

/**
 * Split screen: a cinematic photo panel (desktop, sticky) beside the form.
 * On small screens the photo becomes a short banner on top.
 */
export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Desktop: sticky so the image stays put while the longer register form scrolls. */}
      <aside className="sticky top-0 hidden h-svh p-3 lg:block">
        <div className="relative isolate h-full overflow-hidden rounded-3xl bg-[#12100e] text-white">
          <KenBurnsImage sizes="55vw" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-black/35" />

          <div className="absolute top-8 left-8">
            <BrandLogo className="text-white [--logo-accent:var(--gold)]" />
          </div>

          <figure className="absolute inset-x-8 bottom-8 max-w-lg rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
            <blockquote className="text-3xl leading-tight font-medium tracking-tighter xl:text-4xl">
              A home isn&apos;t just a place.{" "}
              {/* Fixed light tint: the quote sits on a photo in both themes. */}
              <SerifAccent className="text-gold">It&apos;s a feeling.</SerifAccent>
            </blockquote>
            <figcaption className="mt-4 text-sm text-white/75">
              Rental homes across the US, from studios to villas.
            </figcaption>
          </figure>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile banner: the same photo, short, with the logo over it. */}
        <div className="relative isolate h-44 overflow-hidden bg-[#12100e] sm:h-56 lg:hidden">
          <KenBurnsImage sizes="100vw" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/50 via-black/20 to-background" />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-8">
            <BrandLogo className="text-white [--logo-accent:var(--gold)]" />
            <ThemeToggle className="text-white hover:bg-white/15 hover:text-white" />
          </div>
        </div>

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
