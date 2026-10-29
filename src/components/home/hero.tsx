import { HeroImage } from "@/components/home/hero-image";
import { HeroSearch } from "@/components/home/hero-search";
import { SerifAccent } from "@/components/shared/serif-accent";

export function Hero() {
  return (
    <section className="bg-linear-to-b from-wash-from to-wash-to pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Find. Request. <SerifAccent>Move in.</SerifAccent>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Browse verified rentals across the US, send a request in minutes and pay
            securely once your landlord says yes.
          </p>
        </div>

        {/* The search bar overlaps the image's bottom edge. */}
        <div className="relative mt-12">
          <div className="h-[340px] sm:h-[460px] lg:h-[540px]">
            <HeroImage />
          </div>
          <div className="relative z-10 mx-auto -mt-24 max-w-4xl px-2 sm:-mt-12 sm:px-6 md:-mt-10">
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  );
}
