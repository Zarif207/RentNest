import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { SerifAccent } from "@/components/shared/serif-accent";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-5 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      {/* Sticky so the image stays put while the longer register form scrolls. */}
      <aside className="sticky top-0 hidden h-svh p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811"
            alt="Modern villa with a pool at dusk"
            fill
            preload
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
          <blockquote className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
              A home isn&apos;t just a place.{" "}
              {/* Fixed light tint: the quote sits on a photo in both themes. */}
              <SerifAccent className="text-gold">It&apos;s a feeling.</SerifAccent>
            </p>
            <footer className="mt-4 text-sm text-white/75">
              Verified rentals across the US, from studios to villas.
            </footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
