import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";

const BAND_IMAGE = "https://images.unsplash.com/photo-1570129477492-45c003edd2be";

/** "Sell with RentNest": a band for owners that leads to /sell. */
export function SellBand() {
  return (
    <section aria-labelledby="sell-band-title" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center lg:px-8">
        <div className="space-y-5">
          <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">For owners</p>
          <h2 id="sell-band-title" className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
            Sell with <SerifAccent>RentNest</SerifAccent>
          </h2>
          <p className="max-w-lg text-muted-foreground sm:text-lg">
            List your home for sale, answer offers online, and secure your buyer with a deposit through Stripe.
          </p>
          <Button asChild size="lg">
            <Link href="/sell">
              See how selling works <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-muted">
          <Image
            src={BAND_IMAGE}
            alt="A family home with a wraparound porch"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
