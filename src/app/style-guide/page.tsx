import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Heart, Search } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SerifAccent } from "@/components/shared/serif-accent";
import { StarRating } from "@/components/shared/star-rating";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { BookingStatus } from "@/types";

// Temporary review page for the redesign's design system (removed in Step 42).

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { name: "Background", className: "bg-background", light: "#F6F3EE ivory", dark: "#0C0B0A" },
  { name: "Card", className: "bg-card", light: "#FDFBF7", dark: "#161412" },
  { name: "Secondary", className: "bg-secondary", light: "#E9E2D6 sand", dark: "#1C1815 espresso" },
  { name: "Foreground", className: "bg-foreground", light: "#12100E ink", dark: "#F2EEE7" },
  { name: "Primary", className: "bg-primary", light: "#12100E ink", dark: "#C2A878 champagne" },
  { name: "Gold", className: "bg-gold", light: "#C2A878 champagne", dark: "#C2A878 champagne" },
  { name: "Bronze", className: "bg-bronze", light: "#806435 (gold text)", dark: "#C2A878" },
  { name: "Muted text", className: "bg-muted-foreground", light: "#6F685F stone", dark: "#A39A8E" },
];

const STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED", "CANCELLED"];

const ROWS: { title: string; city: string; rent: string; status: BookingStatus }[] = [
  { title: "Modern 3-Bed Apartment in Lincoln Park", city: "Chicago, IL", rent: "$2,900", status: "ACTIVE" },
  { title: "Craftsman Family House", city: "Portland, OR", rent: "$7,200", status: "APPROVED" },
  { title: "Furnished Studio near Lady Bird Lake", city: "Austin, TX", rent: "$1,800", status: "PENDING" },
];

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6 border-t border-border pt-12">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">{eyebrow}</p>
        <h2 className="text-4xl font-light">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium tracking-[0.35em] uppercase">RentNest · Style guide</p>
        <ThemeToggle />
      </header>

      <div className="space-y-6">
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Quiet luxury</p>
        <h1 className="text-6xl leading-[0.95] font-light sm:text-8xl">
          Live somewhere <SerifAccent>extraordinary</SerifAccent>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Ink and ivory, champagne used sparingly, Cormorant Garamond for headings and Manrope for
          everything you read and click.
        </p>
      </div>

      <Section eyebrow="01" title="Palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SWATCHES.map((swatch) => (
            <div key={swatch.name} className="space-y-3">
              <div className={`h-24 rounded-3xl border border-border ${swatch.className}`} />
              <div className="text-sm">
                <p className="font-medium">{swatch.name}</p>
                <p className="text-muted-foreground">
                  <span className="dark:hidden">{swatch.light}</span>
                  <span className="hidden dark:inline">{swatch.dark}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="02" title="Typography">
        <div className="space-y-6">
          <p className="font-heading text-7xl font-light">Display 72 · Light</p>
          <h3 className="text-5xl font-normal">
            Heading 48 with an <SerifAccent>italic</SerifAccent> phrase
          </h3>
          <p className="font-heading text-3xl font-medium">Heading 30 · Medium</p>
          <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Eyebrow · tracked small caps</p>
          <p className="max-w-2xl text-base leading-relaxed">
            Body copy in Manrope. Every residence is shaped around the way you live, with open
            layouts, abundant daylight and materials chosen to age beautifully.
          </p>
          <p className="text-sm text-muted-foreground">Muted text in stone for secondary details.</p>
        </div>
      </Section>

      <Section eyebrow="03" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="gold">
            Search homes <ArrowRight data-icon="inline-end" />
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Large</Button>
          <Button>Default</Button>
          <Button size="sm">Small</Button>
          <Button size="xs">Extra small</Button>
          <Button size="icon" variant="outline" aria-label="Save to favorites">
            <Heart />
          </Button>
          <Button size="icon" aria-label="Open">
            <ArrowUpRight />
          </Button>
        </div>
      </Section>

      <Section eyebrow="04" title="Badges and status">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="gold">Featured</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <StatusBadge status="PAID" />
          <StatusBadge status="FAILED" />
        </div>
        <StarRating rating={4} />
      </Section>

      <Section eyebrow="05" title="Cards and glass">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Earnings this month</CardTitle>
              <CardDescription>Lease value of active rentals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-6xl font-light">$12,480</p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-muted-foreground">Updated just now</span>
              <Button size="icon-sm" variant="outline" aria-label="View earnings">
                <ArrowUpRight />
              </Button>
            </CardFooter>
          </Card>

          <div className="relative min-h-72 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
              alt="Modern two-story home with a lit pool at dusk"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-xl">
              <p className="text-xs tracking-[0.25em] text-white/70 uppercase">Glass panel</p>
              <p className="mt-1 font-heading text-3xl font-light">Lincoln Park, Chicago</p>
              <p className="mt-1 text-sm text-white/80">3 beds · 2 baths · from $2,900/mo</p>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="06" title="Form controls">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sg-city">City</FieldLabel>
            <Input id="sg-city" placeholder="Austin" />
            <FieldDescription>Any US city.</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="sg-email">Email</FieldLabel>
            <Input id="sg-email" defaultValue="not-an-email" aria-invalid />
            <FieldError>Enter a valid email address.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="sg-type">Property type</FieldLabel>
            <Select>
              <SelectTrigger id="sg-type" className="w-full">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="STUDIO">Studio</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="sg-search">Search</FieldLabel>
            <div className="relative">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="sg-search" placeholder="Search homes" className="pl-10" />
            </div>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="sg-message">Message</FieldLabel>
            <Textarea id="sg-message" placeholder="Tell the landlord about yourself" />
          </Field>
        </div>
      </Section>

      <Section eyebrow="07" title="Tabs, dialog and sheet">
        <Tabs defaultValue="tenants" className="max-w-md">
          <TabsList>
            <TabsTrigger value="tenants">For tenants</TabsTrigger>
            <TabsTrigger value="landlords">For landlords</TabsTrigger>
          </TabsList>
          <TabsContent value="tenants" className="pt-2 text-muted-foreground">
            Browse, request, pay securely and move in.
          </TabsContent>
          <TabsContent value="landlords" className="pt-2 text-muted-foreground">
            List, review requests, approve and get paid.
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to rent</DialogTitle>
                <DialogDescription>Pick a move-in date and lease length.</DialogDescription>
              </DialogHeader>
              <Input placeholder="Lease months" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Send request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Confirm dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down homes by type and price.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      <Section eyebrow="08" title="Table">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Property</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.title}>
                  <TableCell className="pl-6 font-medium">{row.title}</TableCell>
                  <TableCell className="text-muted-foreground">{row.city}</TableCell>
                  <TableCell>{row.rent}</TableCell>
                  <TableCell className="pr-6">
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section eyebrow="09" title="Skeleton">
        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="space-y-3">
              <Skeleton className="aspect-4/3 rounded-3xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
