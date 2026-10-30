import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { SerifAccent } from "@/components/shared/serif-accent";
import { formatAddress, SITE_CONTACT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about renting or listing on RentNest? Email, call or send us a message.",
};

const FAQ_LINKS = [
  { href: "/#faq", label: "How does requesting a home work?" },
  { href: "/#faq", label: "How does payment work?" },
  { href: "/#faq", label: "Can I cancel a request?" },
  { href: "/#faq", label: "Which cities can I rent in?" },
];

function mapSrc() {
  const { lat, lon } = SITE_CONTACT.map;
  const bbox = [lon - 0.012, lat - 0.006, lon + 0.012, lat + 0.006].map((n) => n.toFixed(4)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

export default function ContactPage() {
  const { lat, lon } = SITE_CONTACT.map;
  const details = [
    { icon: Mail, label: "Email", value: SITE_CONTACT.email, href: `mailto:${SITE_CONTACT.email}` },
    { icon: Phone, label: "Phone", value: SITE_CONTACT.phone.display, href: SITE_CONTACT.phone.href },
    { icon: MapPin, label: "Office", value: formatAddress() },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="space-y-10">
          <div className="space-y-5">
            <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Contact</p>
            <h1 className="text-5xl leading-[0.98] font-medium tracking-tighter sm:text-6xl lg:text-7xl">
              Let&apos;s <SerifAccent>talk</SerifAccent>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Questions about a listing, a request or a payment? Reach us directly, or send a message and tell us
              what you need.
            </p>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-center gap-4 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-bronze">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
                  {href ? (
                    <a href={href} className="text-lg font-medium break-words underline-offset-4 hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="text-lg font-medium">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="grid gap-8 sm:grid-cols-[1.6fr_1fr]">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                <Clock className="size-4" aria-hidden /> Office hours
              </p>
              <dl className="space-y-1.5 text-sm">
                {SITE_CONTACT.hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-4">
                    <dt className="whitespace-nowrap text-muted-foreground">{row.days}</dt>
                    <dd className="text-right font-medium">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="space-y-3">
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Elsewhere</p>
              <a
                href={SITE_CONTACT.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                RentNest on GitHub <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:pt-8">
          <ContactForm />
        </Reveal>
      </div>

      <Reveal className="mt-20 space-y-4">
        <div className="relative h-80 overflow-hidden rounded-3xl border border-border bg-muted sm:h-104">
          <iframe
            title={`Map showing ${formatAddress()}`}
            src={mapSrc()}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full grayscale-[0.4] dark:brightness-75 dark:grayscale"
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Open larger map
          </a>
        </p>
      </Reveal>

      <Reveal className="mt-16 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Quick answers</p>
          <p className="mt-2 text-2xl font-medium tracking-tight">Your question may already be answered</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {FAQ_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
