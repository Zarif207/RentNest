import { WordScrub } from "@/components/motion/word-scrub";

/** The "about" statement under the hero: words light up as it scrolls through. */
export function HomeStatement() {
  return (
    <section id="about" className="scroll-mt-24 py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">About RentNest</p>
        <WordScrub
          text="We connect people to homes worth staying in. Vetted landlords, transparent monthly pricing and secure payments, from the first request to move-in day."
          className="mt-8 text-[clamp(2rem,5vw,4.25rem)] leading-[1.08] font-medium tracking-tighter"
        />
      </div>
    </section>
  );
}
