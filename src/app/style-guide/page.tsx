import type { Metadata } from "next";
import { ArrowRight, Heart, Plus } from "lucide-react";
import { SerifAccent } from "@/components/shared/serif-accent";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Temporary page for checking the design system; removed in step 24.
export const metadata: Metadata = { title: "Style guide" };

const swatches = [
  { name: "Background", className: "bg-background" },
  { name: "Foreground / ink", className: "bg-foreground" },
  { name: "Surface", className: "bg-surface" },
  { name: "Card", className: "bg-card" },
  { name: "Muted text", className: "bg-muted-foreground" },
  { name: "Border", className: "bg-border" },
  { name: "Brand accent", className: "bg-brand" },
  { name: "Serif accent", className: "bg-serif-accent" },
  { name: "Sky gradient", className: "bg-linear-to-b from-sky-from to-sky-to" },
];

const buttonVariants = [
  "default",
  "outline",
  "accent",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const buttonSizes = ["xs", "sm", "default", "lg"] as const;

const badgeVariants = [
  "default",
  "secondary",
  "outline",
  "destructive",
] as const;

const statusBadges = [
  { variant: "pending", label: "Pending" },
  { variant: "approved", label: "Approved" },
  { variant: "rejected", label: "Rejected" },
  { variant: "active", label: "Active" },
  { variant: "completed", label: "Completed" },
  { variant: "cancelled", label: "Cancelled" },
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-t py-10">
      <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4 pb-10">
        <div>
          <p className="text-sm text-muted-foreground">RentNest</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Design system
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Typography">
        <div className="space-y-6">
          <p className="text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            Find. Request. <SerifAccent>Move in.</SerifAccent>
          </p>
          <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Discover handpicked homes that{" "}
            <SerifAccent>define elegance</SerifAccent>
          </p>
          <p className="text-xl font-semibold">Heading 3 — Hanken Grotesk</p>
          <p className="max-w-2xl leading-relaxed">
            Body text. Browse verified rentals, send a request to the landlord,
            pay securely once approved and move in. Every listing comes with
            real photos, clear pricing and honest reviews.
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Muted text for supporting copy, captions and metadata.
          </p>
          <p className="text-2xl font-bold italic">
            $1,200{" "}
            <span className="text-base font-normal text-muted-foreground not-italic">
              /mo
            </span>
          </p>
        </div>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="space-y-2">
              <div
                className={`h-20 rounded-2xl border ${swatch.className}`}
              />
              <p className="text-sm font-medium">{swatch.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant} className="capitalize">
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {buttonSizes.map((size) => (
              <Button key={size} size={size}>
                Size {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              Find Property <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="outline">
              <Plus data-icon="inline-start" /> Add property
            </Button>
            <Button variant="outline" size="icon" aria-label="Save">
              <Heart />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant} className="capitalize">
                {variant}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusBadges.map((badge) => (
              <Badge key={badge.variant} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-linear-to-b from-sky-from to-sky-to p-8">
            <p className="text-2xl font-semibold tracking-tight">
              Make your dream space <SerifAccent>a reality</SerifAccent>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hero sky gradient
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-xl shadow-black/5">
            <p className="text-2xl font-semibold tracking-tight">
              Floating card
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Soft shadow for floating elements only
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
