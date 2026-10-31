import Image from "@/components/shared/photo";
import {
  CalendarDays,
  Check,
  CreditCard,
  House,
  ImagePlus,
  KeyRound,
  Lock,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

/** A real listing the mocks are dressed with (so the prices are real too). */
export type MockListing = {
  title: string;
  image: string | null;
  rent: number;
  location: string;
};

const LEASE_MONTHS = 12;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function ListingThumb({ listing }: { listing: MockListing }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
        {listing.image ? (
          <Image src={listing.image} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <House className="size-5" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{listing.title}</span>
        <span className="block truncate text-xs text-muted-foreground">{listing.location}</span>
      </span>
    </div>
  );
}

function BrowseMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <div className="flex h-11 items-center gap-2 rounded-2xl border border-input bg-card/60 px-3 text-sm text-muted-foreground">
        <Search className="size-4" /> {listing.location}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="relative aspect-video bg-muted">
          {listing.image && <Image src={listing.image} alt="" fill sizes="400px" className="object-cover" />}
        </div>
        <div className="flex items-center justify-between gap-3 p-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{listing.title}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {listing.location}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold">{formatCurrency(listing.rent)}/mo</span>
        </div>
      </div>
    </div>
  );
}

function RequestMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <ListingThumb listing={listing} />
      <Field label="Move-in date">
        <div className="relative">
          <Input readOnly value="December 1, 2026" className="pl-10" />
          <CalendarDays className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </Field>
      <Field label="Lease length">
        <Input readOnly value={`${LEASE_MONTHS} months`} />
      </Field>
      <Button className="w-full">Send request</Button>
    </div>
  );
}

function ApprovedMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <ListingThumb listing={listing} />
      <ol className="space-y-3 rounded-2xl border border-border p-4">
        <li className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Request sent</span>
          <StatusBadge status="PENDING" />
        </li>
        <li className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Landlord replied</span>
          <StatusBadge status="APPROVED" />
        </li>
      </ol>
      <Button variant="gold" className="w-full">
        Pay now
      </Button>
    </div>
  );
}

function PayMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Lock className="size-3.5" /> Secure checkout by Stripe
      </div>
      <div className="space-y-2 rounded-2xl border border-border p-4">
        <Row label="Monthly rent" value={formatCurrency(listing.rent)} />
        <Row label="Lease" value={`${LEASE_MONTHS} months`} />
        <div className="border-t border-border pt-2">
          <Row label="Total (USD)" value={formatCurrency(listing.rent * LEASE_MONTHS)} />
        </div>
      </div>
      <div className="flex h-11 items-center gap-2 rounded-2xl border border-input bg-card/60 px-3 text-sm">
        <CreditCard className="size-4 text-muted-foreground" />
        <span className="tracking-widest">•••• 4242</span>
      </div>
      <Button className="w-full">
        <Lock /> Pay {formatCurrency(listing.rent * LEASE_MONTHS)}
      </Button>
    </div>
  );
}

function MoveInMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <div className="grid place-items-center gap-3 rounded-2xl bg-gold/15 py-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-gold text-gold-foreground">
          <KeyRound className="size-5" />
        </span>
        <span className="text-lg font-medium tracking-tight">Welcome home</span>
        <StatusBadge status="ACTIVE" />
      </div>
      <ListingThumb listing={listing} />
      <div className="flex items-center justify-between rounded-2xl border border-border p-3 text-sm">
        <span className="text-muted-foreground">Leave a review</span>
        <span className="flex gap-0.5 text-gold">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-4 fill-gold" />
          ))}
        </span>
      </div>
    </div>
  );
}

function ListMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <Field label="Title">
        <Input readOnly value={listing.title} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rent per month">
          <Input readOnly value={formatCurrency(listing.rent)} />
        </Field>
        <Field label="Type">
          <Input readOnly value="Apartment" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <span className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {listing.image && <Image src={listing.image} alt="" fill sizes="96px" className="object-cover" />}
        </span>
        <span className="grid aspect-square place-items-center rounded-xl border border-dashed border-input text-muted-foreground">
          <ImagePlus className="size-5" />
        </span>
        <span className="aspect-square rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function RequestsMock({ listing }: { listing: MockListing }) {
  const rows = [
    { initials: "T1", detail: `Dec 1 · ${LEASE_MONTHS} months` },
    { initials: "T2", detail: "Jan 15 · 6 months" },
    { initials: "T3", detail: "Feb 1 · 18 months" },
  ];
  return (
    <div className="space-y-4">
      <ListingThumb listing={listing} />
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {rows.map((row) => (
          <li key={row.initials} className="flex items-center gap-3 p-3 text-sm">
            <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold">
              {row.initials}
            </span>
            <span className="flex-1 text-muted-foreground">{row.detail}</span>
            <StatusBadge status="PENDING" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApproveMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <ListingThumb listing={listing} />
      <div className="space-y-2 rounded-2xl border border-border p-4">
        <Row label="Move-in" value="December 1, 2026" />
        <Row label="Lease" value={`${LEASE_MONTHS} months`} />
        <Row label="Total rent" value={formatCurrency(listing.rent * LEASE_MONTHS)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">
          <X /> Reject
        </Button>
        <Button>
          <Check /> Approve
        </Button>
      </div>
      <div className="flex justify-center">
        <StatusBadge status="APPROVED" />
      </div>
    </div>
  );
}

function PaidMock({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-foreground p-5 text-background">
        <p className="text-xs tracking-[0.2em] uppercase opacity-70">Earnings</p>
        <p className="mt-2 text-3xl font-medium tracking-tighter">{formatCurrency(listing.rent * LEASE_MONTHS)}</p>
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        <li className="flex items-center justify-between gap-3 p-3 text-sm">
          <span className="text-muted-foreground">Stripe payment</span>
          <StatusBadge status="PAID" />
        </li>
        <li className="flex items-center justify-between gap-3 p-3 text-sm">
          <span className="text-muted-foreground">Rental</span>
          <StatusBadge status="ACTIVE" />
        </li>
      </ul>
    </div>
  );
}

export const MOCKS = {
  browse: BrowseMock,
  request: RequestMock,
  approved: ApprovedMock,
  pay: PayMock,
  moveIn: MoveInMock,
  list: ListMock,
  requests: RequestsMock,
  approve: ApproveMock,
  paid: PaidMock,
} satisfies Record<string, React.ComponentType<{ listing: MockListing }>>;

export type MockKey = keyof typeof MOCKS;
