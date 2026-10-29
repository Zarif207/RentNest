import { cacheLife } from "next/cache";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Logo } from "@/components/shared/logo";
import { SerifAccent } from "@/components/shared/serif-accent";
import type { NavLink } from "@/lib/navigation";

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
    title: "Landlords",
    links: [
      { href: "/dashboard/landlord/properties/new", label: "List a property" },
      { href: "/dashboard/landlord/requests", label: "Rental requests" },
      { href: "/auth/register", label: "Create an account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "#contact", label: "Contact" },
    ],
  },
];

// Cache Components can't prerender a bare `new Date()`; cache it for a day.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-sm text-muted-foreground">
              Find. Request.{" "}
              {/* Body-size text: ink instead of the accent blue, which fails AA here. */}
              <SerifAccent className="text-foreground">Move in.</SerifAccent> Verified rentals
              across the US, with secure payments and honest reviews.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Get new listings by email</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="min-w-0 space-y-4">
                <h2 className="text-sm font-semibold">{column.title}</h2>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div id="contact" className="min-w-0 scroll-mt-24 space-y-4">
              <h2 className="text-sm font-semibold">Contact</h2>
              <address className="space-y-2.5 text-sm text-muted-foreground not-italic">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  350 Fifth Avenue, New York, NY 10118
                </p>
                <a
                  href="mailto:support@rentnest.com"
                  className="flex gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-all">support@rentnest.com</span>
                </a>
                <a
                  href="tel:+12125550100"
                  className="flex gap-2 transition-colors hover:text-foreground"
                >
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                  +1 (212) 555-0100
                </a>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> RentNest. All rights reserved.
          </p>
          <p>Prices in USD · Payments secured by Stripe</p>
        </div>
      </div>
    </footer>
  );
}
