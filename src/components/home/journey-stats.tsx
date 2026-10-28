import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { formatNumber } from "@/lib/format";

export type HomeStat = {
  value: number | null;
  label: string;
  description: string;
};

/** The "about" section: wide image with stat cards overlapping its bottom edge. */
export function JourneyStats({ stats }: { stats: HomeStat[] }) {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow="About RentNest"
            title={
              <>
                Your journey to the perfect home <SerifAccent>starts with us</SerifAccent>
              </>
            }
            description="One place for tenants to find and pay for a home, and for landlords to fill their listings with people they've approved."
          />
        </FadeIn>

        <FadeIn className="mt-12">
          <div className="relative h-72 overflow-hidden rounded-3xl sm:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
              alt="Bright open-plan living room with large windows"
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>
          <dl className="relative z-10 -mt-16 grid gap-4 px-4 sm:-mt-20 sm:grid-cols-3 sm:px-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border bg-background p-6 shadow-xl shadow-black/5"
              >
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-2 text-4xl font-semibold tracking-tight">
                  {formatNumber(stat.value)}
                </dd>
                <dd className="mt-2 text-sm text-muted-foreground">{stat.description}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>
    </section>
  );
}
