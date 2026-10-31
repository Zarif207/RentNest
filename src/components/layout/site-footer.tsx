import { cacheLife } from "next/cache";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BackToTop, FooterWordmark } from "@/components/layout/footer-motion";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Magnetic } from "@/components/motion/magnetic";
import { CookieSettingsButton } from "@/components/consent/cookie-consent";
import { Marquee } from "@/components/motion/marquee";
import { SerifAccent } from "@/components/shared/serif-accent";
import type { NavLink } from "@/lib/navigation";
import { formatAddress, SITE_CONTACT } from "@/lib/site-config";

const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?propertyType=APARTMENT", label: "Apartments" },
      { href: "/properties?propertyType=HOUSE", label: "Houses" },
      { href: "/properties?propertyType=STUDIO", label: "Studios" },
      { href: "/properties?propertyType=VILLA", label: "Villas" },
    ],
  },
  {
    title: "For landlords",
    links: [
      { href: "/auth/register?role=LANDLORD", label: "Become a landlord" },
      { href: "/dashboard/landlord/properties/new", label: "List a property" },
      { href: "/dashboard/landlord/requests", label: "Rental requests" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/auth/login", label: "Sign in" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

const MARQUEE_WORDS = ["Find", "Request", "Move in"];

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

const SOCIALS = [
  { href: SITE_CONTACT.github, label: "RentNest on GitHub", icon: GitHubIcon },
  { href: `mailto:${SITE_CONTACT.email}`, label: "Email RentNest", icon: Mail },
  { href: SITE_CONTACT.phone.href, label: "Call RentNest", icon: Phone },
];

// Cache Components can't prerender a bare `new Date()`; cache it for a day.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * The site's finale: a marquee strip, newsletter row, link columns, contact,
 * socials and back-to-top, then an oversized outlined wordmark. Always dark
 * (the `dark` class switches its tokens), in both themes.
 */
export function SiteFooter() {
  return (
    <footer className="dark mt-2 overflow-hidden bg-background text-foreground">
      <div className="border-y border-white/10 py-4 text-sm tracking-[0.3em] text-white/60 uppercase">
        <Marquee duration={30} pauseOnHover={false}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex shrink-0 items-center">
              {MARQUEE_WORDS.map((word) => (
                <span key={word} className="flex items-center">
                  <span className="px-6">{word}</span>
                  <span className="size-1.5 rounded-full bg-gold" aria-hidden />
                </span>
              ))}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.25em] text-gold uppercase">Newsletter</p>
            <h2 className="mt-4 text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl">
              New homes, <SerifAccent className="text-gold">first</SerifAccent>
            </h2>
            <p className="mt-3 text-muted-foreground">Fresh listings and renting tips, about once a month.</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-12 py-14 lg:grid-cols-[1fr_3.2fr]">
          <div className="space-y-6">
            <BrandLogo size="lg" />
            <p className="max-w-xs text-muted-foreground">
              Rental homes across the US, with secure Stripe payments and reviews from real tenants.
            </p>
            <ul className="flex gap-3">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <Magnetic>
                    <a
                      href={href}
                      aria-label={label}
                      {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors outline-none hover:border-gold hover:text-gold focus-visible:ring-3 focus-visible:ring-gold/50"
                    >
                      <Icon className="size-4" />
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.6fr)] lg:gap-8">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="min-w-0 space-y-4">
                <h2 className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">{column.title}</h2>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/80 transition-colors outline-none hover:text-gold focus-visible:text-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 min-w-0 space-y-4 sm:col-span-1">
              <h2 className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">Contact</h2>
              <address className="space-y-3 text-sm text-white/80 not-italic">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  {formatAddress()}
                </p>
                <a href={`mailto:${SITE_CONTACT.email}`} className="flex gap-2 transition-colors hover:text-gold">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  <span className="min-w-0 break-all">{SITE_CONTACT.email}</span>
                </a>
                <a href={SITE_CONTACT.phone.href} className="flex gap-2 transition-colors hover:text-gold">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  {SITE_CONTACT.phone.display}
                </a>
              </address>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-8">
          <p className="text-sm text-muted-foreground">Prices in USD · Payments secured by Stripe</p>
          <BackToTop />
        </div>
      </div>

      <div className="px-4 pt-8 sm:px-6 lg:px-8">
        <FooterWordmark />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © <CurrentYear /> RentNest. All rights reserved.
        </p>
        <ul className="flex gap-5">
          <li>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of use
            </Link>
          </li>
          <li>
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
          </li>
          <li>
            <CookieSettingsButton className="transition-colors outline-none hover:text-foreground focus-visible:text-foreground" />
          </li>
        </ul>
      </div>
    </footer>
  );
}
