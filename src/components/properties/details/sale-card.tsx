import { ShieldCheck } from "lucide-react";
import { MakeOffer } from "@/components/offers/make-offer";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import { availabilityLabel, pricePerSqft } from "@/lib/listing";
import { depositFor } from "@/lib/offers";
import type { AvailabilityStatus, PropertyWithRelations } from "@/types";


const STATUS_BADGE: Record<AvailabilityStatus, "active" | "pending" | "completed"> = {
  AVAILABLE: "active",
  UNDER_CONTRACT: "pending",
  RENTED: "completed",
  SOLD: "completed",
};

/**
 * The sticky panel for a home for sale: asking price, price per sq ft, the
 * stat trio and "Make an offer". Under contract or sold, the button is off.
 */
export function SaleCard({ property }: { property: PropertyWithRelations }) {
  const price = Number(property.salePrice);
  const perSqft = pricePerSqft(property);
  const status = property.availabilityStatus;
  const open = status === "AVAILABLE";
  const stats = [
    { value: formatNumber(property.bedrooms), label: property.bedrooms === 1 ? "Bed" : "Beds" },
    { value: formatNumber(property.bathrooms), label: property.bathrooms === 1 ? "Bath" : "Baths" },
    { value: formatNumber(property.area), label: "Sq ft" },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl dark:shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Asking price</p>
          <p className="mt-1 text-4xl font-medium tracking-tighter">{formatCurrency(property.salePrice)}</p>
          {perSqft && <p className="mt-1 text-sm text-muted-foreground">{perSqft}</p>}
        </div>
        <Badge variant={STATUS_BADGE[status]}>{open ? "For sale" : availabilityLabel(status)}</Badge>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-y border-border py-5 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-xs tracking-[0.15em] text-muted-foreground uppercase">{stat.label}</dt>
            <dd className="font-serif text-4xl leading-none lining-nums tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <MakeOffer property={property} />

      {open && price > 0 && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bronze" aria-hidden />
          Once the owner accepts, a deposit of 1% of the agreed price (about {formatCurrency(depositFor(price))} at
          this price) puts the home under contract. The full price is never charged here.
        </p>
      )}
    </div>
  );
}
