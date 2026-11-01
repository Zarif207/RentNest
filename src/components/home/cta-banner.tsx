import Image from "@/components/shared/photo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";

// Two hands passing a set of house keys (Alena Darmel on Pexels, photo 7642000,
// free licence), served from /public so it needs no remote image host.
const CTA_IMAGE = "/images/cta-keys-handover.jpg";

/** Closing call to action: full-width photo with parallax under a dark wash. */
export function CtaBanner() {
  return (
    <section className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="relative isolate overflow-hidden rounded-3xl bg-[#12100e] text-white">
        {/* Taller than the frame so the parallax never shows an edge. */}
        <Parallax speed={0.25} className="absolute -inset-y-24 inset-x-0 -z-10">
          <Image src={CTA_IMAGE} alt="" fill sizes="100vw" className="object-cover object-[50%_40%]" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/55 to-black/35" />

        <Reveal className="mx-auto flex min-h-[80svh] max-w-7xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.3em] text-white/70 uppercase">Start today</p>
          <h2 className="mt-6 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] font-medium tracking-tighter">
            Your next chapter starts <SerifAccent className="text-gold">here</SerifAccent>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            Rent or buy a home in minutes, or list your property and start receiving requests and offers.
          </p>
          <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/properties">
                Find a home <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/auth/register?role=LANDLORD">List your property</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
