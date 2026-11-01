"use client";

import { usePathname } from "next/navigation";
import Image from "@/components/shared/photo";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SerifAccent } from "@/components/shared/serif-accent";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type Scene = {
  image: string;
  alt: string;
  lead: string;
  accent: string;
  caption: string;
};

// Login is coming home in the evening; register is the first look at a new place.
const SCENES: Record<"login" | "register", Scene> = {
  login: {
    image: "https://images.unsplash.com/photo-1698870157085-11632d2ddef8",
    alt: "Warmly lit living room at dusk with a fireplace and tall windows",
    lead: "Welcome back.",
    accent: "The lights are on.",
    caption: "Pick up where you left off: saved homes, requests and offers.",
  },
  register: {
    image: "https://images.unsplash.com/photo-1766603636700-e9d80473f40f",
    alt: "Modern two-story home with large windows over a green lawn",
    lead: "Your next chapter",
    accent: "starts at the door.",
    caption: "Rent or buy from verified landlords and owners.",
  },
};

const LOGO_CLASS = "text-white [--logo-accent:var(--gold)] [--logo-eye:#12100e]";

function useScene() {
  return SCENES[usePathname().startsWith("/auth/register") ? "register" : "login"];
}

/** The scene's photo with a slow Ken Burns push-in (stopped under reduced motion). */
function ScenePhoto({ scene, sizes }: { scene: Scene; sizes: string }) {
  return (
    <Image
      key={scene.image}
      src={scene.image}
      alt={scene.alt}
      fill
      preload
      sizes={sizes}
      className="object-cover motion-safe:animate-[ken-burns_24s_ease-out_infinite_alternate]"
    />
  );
}

/**
 * Desktop: a sticky photo panel with the logo, a quote and a floating glass
 * card holding live numbers (`stats`). Each auth page has its own scene.
 */
export function AuthShowcase({ stats }: { stats: React.ReactNode }) {
  const scene = useScene();
  return (
    <aside className="sticky top-0 hidden h-svh p-3 lg:block">
      <div className="relative isolate h-full overflow-hidden rounded-3xl bg-[#12100e] text-white">
        <ScenePhoto scene={scene} sizes="55vw" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/45" />

        <div className="absolute inset-x-8 top-8 flex items-start justify-between gap-6">
          <BrandLogo className={LOGO_CLASS} />
          {/* Fixed light glass: it sits on a photo in both themes. */}
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-3 motion-safe:duration-700">
            {stats}
          </div>
        </div>

        <figure
          key={scene.lead}
          className="absolute inset-x-8 bottom-10 max-w-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
        >
          <blockquote className="text-4xl leading-[1.05] font-medium tracking-tighter xl:text-5xl">
            {scene.lead} <SerifAccent className="text-gold">{scene.accent}</SerifAccent>
          </blockquote>
          <figcaption className="mt-4 max-w-sm text-sm text-white/75">{scene.caption}</figcaption>
        </figure>
      </div>
    </aside>
  );
}

/** Phones and tablets: a compact image header with the logo and theme toggle. */
export function AuthMobileHeader() {
  const scene = useScene();
  return (
    <div className="relative isolate h-40 overflow-hidden bg-[#12100e] sm:h-52 lg:hidden">
      <ScenePhoto scene={scene} sizes="100vw" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/55 via-black/25 to-background" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-8">
        <BrandLogo className={LOGO_CLASS} />
        <ThemeToggle className="text-white hover:bg-white/15 hover:text-white" />
      </div>
    </div>
  );
}
