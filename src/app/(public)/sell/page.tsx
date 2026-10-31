import type { Metadata } from "next";
import Image from "next/image";
import { BellRing, HandCoins, ShieldCheck, Signature, Tag, UserCheck } from "lucide-react";
import { HomeFaq, type FaqItem } from "@/components/home/home-faq";
import { SellCta } from "@/components/sell/sell-cta";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { SerifAccent } from "@/components/shared/serif-accent";
import { getPublicProperties, orNull } from "@/lib/data/public";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sell your home",
  description:
    "List your home for sale on RentNest: receive offers online, accept, counter or decline, and secure the buyer with a deposit through Stripe.",
};

const HERO_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";

const STEPS = [
  {
    title: "List",
    body: "Create an owner account. Once an admin approves it, add your home, switch it to For sale and set your asking price.",
  },
  {
    title: "Receive offers",
    body: "Buyers send offers with their price, how they'll pay and a note. Accept, decline, or counter with your own price.",
  },
  {
    title: "Close",
    body: "When a price is agreed, the buyer pays a deposit through Stripe and the home goes under contract. Mark it sold once the sale closes.",
  },
];

// What the app actually does for owners; nothing here is a promise beyond that.
const BENEFITS = [
  {
    icon: HandCoins,
    title: "Every offer in one place",
    body: "See the buyer, their price, financing and message side by side, and answer each one in a click.",
  },
  {
    icon: Signature,
    title: "A deposit before it's off the market",
    body: "The home goes under contract only after the buyer pays a deposit of 1% of the agreed price (at least $500) through Stripe Checkout.",
  },
  {
    icon: BellRing,
    title: "Notified at every step",
    body: "New offers, accepted counters, withdrawals and deposits each send you a notification with a link to the offer.",
  },
  {
    icon: UserCheck,
    title: "Real owners only",
    body: "Every owner account is approved by an admin before it can list homes or answer offers.",
  },
  {
    icon: Tag,
    title: "No listing fee",
    body: "Listing a home and receiving offers on RentNest costs nothing. The deposit is paid by the buyer.",
  },
  {
    icon: ShieldCheck,
    title: "Your price, your call",
    body: "Offers that go 7 days without an answer expire on their own, and you can decline any open offer.",
  },
];

const FAQ: FaqItem[] = [
  {
    question: "How do I list a home for sale?",
    answer:
      "Register as an owner (a landlord account). After an admin approves it, add a property from your dashboard, choose For sale at the top of the form and enter your asking price.",
  },
  {
    question: "What can I do when an offer arrives?",
    answer:
      "Accept it, decline it, or counter with another price. If you counter, the buyer can accept your price or withdraw. Offers with no action for 7 days expire.",
  },
  {
    question: "What is the buyer's deposit?",
    answer:
      "Once you and the buyer agree on a price, they pay an earnest-money deposit of 1% of that price (at least $500) through Stripe Checkout. The home then goes under contract, and every other open offer on it is closed.",
  },
  {
    question: "When is my home marked sold?",
    answer:
      "After the deposit is paid, you mark the sale completed from your Offers page once the sale has closed. The home is then shown as sold and leaves the listings.",
  },
  {
    question: "Can a buyer back out?",
    answer:
      "Before paying the deposit, yes: buyers can withdraw an offer at any time. After the deposit, they can't withdraw in the app and are asked to contact you.",
  },
  {
    question: "Can I switch a rental listing to a sale?",
    answer:
      "Yes, as long as the home has no rental requests or offers yet. Open the listing's edit form and switch it from For rent to For sale.",
  },
];

export default async function SellPage() {
  const forSale = await orNull(getPublicProperties({ listingType: "SALE", availabilityStatus: "AVAILABLE", limit: 1 }));
  const count = forSale?.meta.total ?? 0;

  return (
    <>
      <section className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="relative isolate flex min-h-[86svh] items-end overflow-hidden rounded-3xl bg-[#12100e] text-white">
          <Image src={HERO_IMAGE} alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-black/30" />
          <div className="mx-auto w-full max-w-7xl px-4 pt-40 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <p className="text-xs font-medium tracking-[0.3em] text-white/75 uppercase">Sell with RentNest</p>
            <h1 className="mt-5 max-w-4xl text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-medium tracking-tighter">
              Sell your home, <SerifAccent className="text-gold">on your terms</SerifAccent>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              List it for sale, answer offers online and secure your buyer with a deposit through Stripe.
              {count > 0 && ` ${formatNumber(count)} ${count === 1 ? "home is" : "homes are"} for sale on RentNest right now.`}
            </p>
            <SellCta tone="dark" className="mt-10" />
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="How it works"
              title={
                <span id="steps-title">
                  Three steps <SerifAccent>to sold</SerifAccent>
                </span>
              }
            />
          </FadeIn>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="font-serif text-5xl leading-none text-bronze lining-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-medium tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="benefits-title" className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Why sell here"
              title={
                <span id="benefits-title">
                  Built for owners, <SerifAccent>not middlemen</SerifAccent>
                </span>
              }
            />
          </FadeIn>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="space-y-3 rounded-3xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-full bg-gold/15 text-bronze">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="sell-faq-title" className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Seller FAQ"
              title={
                <span id="sell-faq-title">
                  Questions, <SerifAccent>answered</SerifAccent>
                </span>
              }
              description="How listing, offers and deposits work for owners."
            />
          </FadeIn>
          <FadeIn>
            <HomeFaq items={FAQ} />
          </FadeIn>
        </div>
      </section>

      <section className="px-2 pb-2 sm:px-3 sm:pb-3">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-[#12100e] px-6 py-14 text-white sm:px-10 md:flex-row md:items-end lg:px-14">
          <div className="max-w-xl space-y-3">
            <h2 className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
              Ready to <SerifAccent className="text-gold">list?</SerifAccent>
            </h2>
            <p className="text-white/75">It takes a few minutes to add photos, details and your asking price.</p>
          </div>
          <SellCta tone="dark" />
        </div>
      </section>
    </>
  );
}
