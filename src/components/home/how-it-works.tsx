import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";

const JOURNEYS = [
  {
    audience: "For tenants",
    steps: [
      {
        title: "Find a home",
        text: "Search by city, price, type and amenities, then compare listings side by side.",
      },
      {
        title: "Request to rent",
        text: "Pick a move-in date and lease length. The landlord reviews your request.",
      },
      {
        title: "Pay and move in",
        text: "Once approved, pay securely with Stripe and your rental becomes active.",
      },
    ],
  },
  {
    audience: "For landlords",
    steps: [
      {
        title: "List your property",
        text: "Add photos, rent, amenities and location in a few minutes.",
      },
      {
        title: "Review requests",
        text: "Approve or reject tenants with one click and see who's asking.",
      },
      {
        title: "Get paid",
        text: "Tenants pay up front through Stripe; track earnings from your dashboard.",
      },
    ],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={
              <>
                Three steps, <SerifAccent>either side</SerifAccent> of the door
              </>
            }
          />
        </FadeIn>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {JOURNEYS.map((journey) => (
            <FadeIn key={journey.audience} className="rounded-3xl bg-background p-6 sm:p-8">
              <h3 className="text-xl font-semibold tracking-tight">{journey.audience}</h3>
              <ol className="mt-6 space-y-6">
                {journey.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
